$(document).ready(function () {
  const cartExpirationMinutes = 2 * 24 * 60;
  const cartItemsContainer = $("#cart-items");
  const emptyCartMessage = $("#empty-cart");
  let itemsPerPage = 4;
  let currentPage = 1;
  let isLoading = false;

  // Adjust itemsPerPage based on screen height to ensure initial fill
  function calculateItemsPerPage() {
    const itemHeight = 150; 
    itemsPerPage = Math.ceil(window.innerHeight / itemHeight);
  }
  calculateItemsPerPage();

  function getCartData() {
    let cartData = lscache.get("cart");
    return cartData ? cartData : {};
  }

  function setCartData(cart) {
    lscache.set("cart", cart, cartExpirationMinutes);
    updateCartCount();
    calculateAndUpdateTotals();
  }

  function updateCartCount() {
    let cartCount = 0;
    const cart = getCartData();
    for (let productId in cart) {
      cartCount += cart[productId].quantity;
    }
    $(".cart-count").text(cartCount);
    lscache.set("cartCount", cartCount, cartExpirationMinutes);
  }

  function calculateAndUpdateTotals() {
    const cart = getCartData();
    let subtotal = 0;
    for (let productId in cart) {
      const item = cart[productId];
      subtotal += item.price * item.quantity;
    }
    const platformFee = subtotal * 0.013;
    const grandTotal = subtotal + platformFee;

    $("#total-price").text(subtotal.toFixed(2));
    $("#platform-fee").text(platformFee.toFixed(2));
    $("#grand-total").text(grandTotal.toFixed(2));
  }

  function renderSkeletons(count) {
    let skeletonHTML = "";
    for (let i = 0; i < count; i++) {
      skeletonHTML += `
        <div class="cart-item d-flex align-items-center mb-4 p-3 shadow-sm rounded skeleton">
          <div class="skeleton-img me-3"></div>
          <div class="flex-grow-1">
            <div class="skeleton-title"></div>
            <div class="skeleton-price mb-1"></div>
            <div class="skeleton-quantity-control d-flex align-items-center">
              <div class="skeleton-btn"></div>
              <div class="skeleton-quantity"></div>
              <div class="skeleton-btn"></div>
            </div>
          </div>
          <div class="skeleton-remove-btn ms-3"></div>
        </div>
      `;
    }
    cartItemsContainer.append(skeletonHTML);
  }

  function renderCartItems(page) {
    const cart = getCartData();
    const cartItems = Object.keys(cart);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToRender = cartItems.slice(startIndex, endIndex);
    
    // Remove previous skeletons
    cartItemsContainer.find(".skeleton").remove();
    
    if (cartItems.length === 0) {
      emptyCartMessage.show();
      cartItemsContainer.hide();
    } else {
      emptyCartMessage.hide();
      cartItemsContainer.show();
      
      let imagesLoaded = 0;
      const totalImages = itemsToRender.length;
  
      itemsToRender.forEach(productId => {
        const item = cart[productId];
        const cartItemHTML = `
          <div class="cart-item d-flex align-items-center mb-4 p-3 shadow-sm rounded fade-in" data-product-id="${productId}">
            <img src="${item.image}" alt="${item.name}" class="product-img me-3" style="width: 80px; height: 80px;">
            <div class="flex-grow-1">
              <h5 class="product-title text-truncate">${item.name}</h5>
              <p class="product-price text-muted mb-1">Price: ₹<span class="price">${item.price}</span></p>
              <div class="quantity-control d-flex align-items-center">
                <button class="btn btn-outline-secondary btn-sm quantity-decrease">-</button>
                <span class="quantity mx-2">${item.quantity}</span>
                <button class="btn btn-outline-secondary btn-sm quantity-increase">+</button>
              </div>
            </div>
            <button class="btn btn-outline-danger btn-sm ms-3 remove-item">Remove</button>
          </div>
        `;
        cartItemsContainer.append(cartItemHTML);
      });
  
      // Track image load events for each product image
      cartItemsContainer.find(".product-img").on("load", function () {
        imagesLoaded++;
  
        // Remove skeletons once all images are loaded
        if (imagesLoaded === totalImages) {
          cartItemsContainer.find(".skeleton").remove();
        }
      }).on("error", function () {
        // Fallback image in case of load error
        $(this).attr("src", "path/to/fallback-image.jpg");
        imagesLoaded++;
  
        // Remove skeletons even if some images failed to load
        if (imagesLoaded === totalImages) {
          cartItemsContainer.find(".skeleton").remove();
        }
      });
  
      observeLastProduct();
    }
    
    attachEventHandlers();
    isLoading = false;
  }  

  function attachEventHandlers() {
    $(".quantity-increase").off("click").on("click", function () {
      const productId = $(this).closest(".cart-item").data("product-id");
      updateQuantity(productId, 1);
    });

    $(".quantity-decrease").off("click").on("click", function () {
      const productId = $(this).closest(".cart-item").data("product-id");
      updateQuantity(productId, -1);
    });

    $(".remove-item").off("click").on("click", function () {
      const productId = $(this).closest(".cart-item").data("product-id");
      removeItem(productId);
    });
  }

  function updateQuantity(productId, change) {
    const cart = getCartData();
    if (cart[productId]) {
      cart[productId].quantity += change;
      if (cart[productId].quantity <= 0) {
        delete cart[productId];
      }
      setCartData(cart);
      renderCartState();
    }
  }

  function removeItem(productId) {
    const cart = getCartData();
    delete cart[productId];
    setCartData(cart);
    renderCartState();
  }

  function renderCartState() {
    cartItemsContainer.empty();
    currentPage = 1;
    renderSkeletons(itemsPerPage);
    renderCartItems(currentPage);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isLoading) {
        isLoading = true;
        currentPage++;
        renderCartItems(currentPage);
      }
    });
  }, {
    root: null,
    rootMargin: '100px',
    threshold: 1.0,
  });

  function observeLastProduct() {
    const lastProduct = cartItemsContainer.find('.cart-item').last();
    if (lastProduct.length) {
      observer.observe(lastProduct[0]);
    }
  }

  $("#checkout-btn, #checkout-btn-mobile").on("click", redirectToCheckout);

  function redirectToCheckout() {
    window.location.href = "bill.html";
  }

  updateCartCount();
  renderSkeletons(itemsPerPage);
  renderCartItems(currentPage);
  calculateAndUpdateTotals();
});
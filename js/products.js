$(document).ready(function () {
  // =============== HEADER ===============
  const header = $("#main-header");
  const cartButton = $("#cart-button");
  let lastScrollTop = 0;
  let scrollTimeout;

  function handleScroll() {
    $(window).scroll(function () {
      let currentScroll = $(this).scrollTop();

      // Toggle header and cart button based on scroll direction
      if (currentScroll > lastScrollTop) {
        header.css("top", "-110px");
        cartButton
          .removeClass("cart-button-show")
          .addClass("cart-button-hidden");
      } else {
        header.css("top", "0");
        cartButton
          .removeClass("cart-button-hidden")
          .addClass("cart-button-show");
      }

      lastScrollTop = currentScroll;

      // Reset timeout to show header and cart button after inactivity
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function () {
        header.css("top", "0");
        cartButton
          .removeClass("cart-button-hidden")
          .addClass("cart-button-show");
      }, 300);
    });
  }

  // =============== PRODUCTS ===============
  let currentPage = 1;
  const productsPerPage = 8;
  const productContainer = $("#product-list");
  let allProducts = [];
  let fuse;

  // Initialize cart count from lscache
  let cartCount = lscache.get("cartCount") || 0;
  const productCounts = store.get("productCounts") || {};

  // Function to update cart count display and visibility
  function updateCartCount() {
    $(".cart-count").text(cartCount);
    
    // Toggle cart button visibility based on cart count
    if (cartCount > 0) {
      $(".cart-button").removeClass("d-none");
    } else {
      $(".cart-button").addClass("cart-button-show");
    }
  }

  updateCartCount();

  // Render skeletons for loading effect
  function renderSkeletons(count) {
    let skeletonHTML = "";
    for (let i = 0; i < count; i++) {
      skeletonHTML += `
        <div class="col-12 col-sm-6 col-md-4 col-lg-3 skeleton">
          <div class="card mb-4">
            <div class="skeleton-img"></div>
            <div class="card-body d-flex flex-column">
              <div class="skeleton-title"></div>
              <div class="skeleton-price"></div>
              <div class="skeleton-btn"></div>
            </div>
          </div>
        </div>
      `;
    }
    productContainer.append(skeletonHTML);
  }

  // Render products onto the page
  function renderProducts(products) {
    const productHTML = products
      .map(
        (product) => `
    <div class="col-12 col-sm-6 col-md-4 col-lg-3 product-container" data-product-id="${product.id}">
      <div class="card mb-4 product-card">
        <img src="${product.image}" class="card-img-top product-image" alt="Loading..." />
        <div class="card-body d-flex flex-column">
          <span class="card-title">${product.name}</span>
          <div class="d-flex justify-content-between align-items-center mt-1">
            <span class="price-container">
              <span class="currency-symbol">₹</span>
              <span class="card-price">${product.cost}</span>
            </span>
            <button class="btn btn-sm btn-outline-primary">🛒 Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  `
      )
      .join("");

    // Add skeletons before the products
    productContainer.append(productHTML);

    // Track image loading
    let imagesLoaded = 0;
    const totalImages = products.length;

    // Wait until all images have loaded before removing skeletons
    $(".product-image")
      .on("load", function () {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
          // Remove all skeletons only after all images have loaded
          productContainer.find(".skeleton").remove();
        }
      })
      .on("error", function () {
        // Handle error by setting a fallback image
        $(this).attr("src", "path/to/default-image.jpg");
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
          productContainer.find(".skeleton").remove();
        }
      });
  }

  // Cache management for products
  const cacheExpirationMinutes = 60;
  const productsCacheKey = "cachedProducts";
  const cacheTimestampKey = "cachedProductsTimestamp";

  function isCacheValid() {
    const cachedTimestamp = store.get(cacheTimestampKey);
    if (!cachedTimestamp) return false;

    const now = Date.now();
    const cacheAge = (now - cachedTimestamp) / (1000 * 60);
    return cacheAge < cacheExpirationMinutes;
  }

  // Load products with caching
  function loadProducts(page, searchQuery = "") {
    renderSkeletons(productsPerPage);

    if (isCacheValid() && !searchQuery) {
      const cachedProducts = store.get(productsCacheKey);
      allProducts = cachedProducts;
      processProducts(allProducts, page, searchQuery);
    } else {
      fetch("data/products.json")
        .then((response) => {
          if (!response.ok) throw new Error("Network response was not ok");
          return response.json();
        })
        .then((products) => {
          allProducts = products;
          store.set(productsCacheKey, products);
          store.set(cacheTimestampKey, Date.now());
          processProducts(allProducts, page, searchQuery);
        })
        .catch((error) => {
          console.error("Error loading products:", error);
          productContainer
            .empty()
            .append(
              `<div class="error-message">Failed to load products. Please try again later.</div>`
            );
        });
    }
  }

  // Process and render products after fetching or from cache
  function processProducts(products, page, searchQuery) {
    const options = {
      keys: ["name", "cost", "tags", "company", "description"],
      threshold: 0.3,
    };
    fuse = new Fuse(products, options);

    let filteredProducts = searchQuery
      ? fuse.search(searchQuery).map((result) => result.item)
      : products;
    const start = (page - 1) * productsPerPage;
    const end = start + productsPerPage;
    const paginatedProducts = filteredProducts.slice(start, end);

    renderProducts(paginatedProducts);

    if (filteredProducts.length === 0) {
      $("#no-product-found").removeClass("d-none");
      productContainer.addClass("d-none");
    } else {
      $("#no-product-found").addClass("d-none");
      productContainer.removeClass("d-none");
    }

    checkContentOverflow();

    if (end >= filteredProducts.length) {
      $(document).off("scroll.infiniteScroll");
    } else {
      observeNextProduct();
    }
  }

  // Check if content overflows the window and load more if necessary
  function checkContentOverflow() {
    const containerHeight = productContainer.outerHeight();
    const windowHeight = $(window).height();

    if (containerHeight < windowHeight) {
      currentPage++;
      loadProducts(currentPage, $("#search").val());
    }
  }

  // Create IntersectionObserver to load more products when the last product comes into view
  function observeNextProduct() {
    const lastProduct = productContainer.find(".product-container:last");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            currentPage++;
            loadProducts(currentPage, $("#search").val());
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "100px",
      }
    );

    observer.observe(lastProduct[0]);
  }

  // Search functionality
  function performSearch() {
    const searchQuery = $("#search").val().trim();
    currentPage = 1;
    productContainer.empty();
    loadProducts(currentPage, searchQuery);
    
    // Close keyboard by removing focus from search input
    $("#search").blur();
  }

  // Also modify the Enter key handler
  $("#search").on("keydown", function (event) {
    if (event.key === "Enter") {
      performSearch();
    
      // Close keyboard
      $(this).blur();
    }
  });

  // Trigger search on button click or Enter key
  $("#search-btn").on("click", performSearch);
  $("#search").on("keydown", function (event) {
    if (event.key === "Enter") performSearch();
  });

  // Auto-reset search if input is empty
  $("#search").on("input", function () {
    const searchQuery = $(this).val().trim();
    if (!searchQuery) {
      $("#search-btn").prop("disabled", true);
      currentPage = 1;
      productContainer.empty();
      loadProducts(currentPage);
      $("#no-product-found").addClass("d-none");
      productContainer.removeClass("d-none");
    } else {
      $("#search-btn").prop("disabled", false);
    }
  });

  // Disable search button initially if input is empty
  $("#search-btn").prop("disabled", true);

  // Cart handling
  function getCartData() {
    return lscache.get("cart") || {};
  }

  $(".cart-button").on("click", function () {
    window.location.href = "cart.html";
  });

  function setCartData(cart) {
    lscache.set("cart", cart, 2 * 24 * 60);
    lscache.set("cartCount", cartCount, 2 * 24 * 60);
  }

  function handleAddToCart(productId, productName, productPrice, productImage) {
    let cart = getCartData();

    if (cart[productId]) {
      cart[productId].quantity++;
    } else {
      cart[productId] = {
        name: productName,
        price: productPrice,
        image: productImage,
        quantity: 1,
      };
    }

    cartCount++;
    updateCartCount();
    setCartData(cart);
  }

  productContainer.on("click", ".btn-outline-primary", function () {
    const productElement = $(this).closest(".product-container");
    const productId = productElement.data("product-id");
    const productName = productElement.find(".card-title").text();
    const productPrice = parseFloat(
      productElement.find(".card-price").text().replace("₹", "")
    );
    const productImage = productElement.find(".product-image").attr("src");

    handleAddToCart(productId, productName, productPrice, productImage);
  });

  // Initial product load
  loadProducts(currentPage);
  handleScroll();
});
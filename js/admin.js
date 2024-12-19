// =============== SIDEBAR ===============
$(document).ready(function () {
  // Sidebar toggle
  $("#toggle-sidebar").click(function () {
    $("#sidebar").toggleClass("collapsed");
    if ($(window).width() <= 768) {
      $("#main-content").toggleClass("overlay");
    } else {
      $("#main-content").toggleClass("collapsed");
    }
  });

  // Navigation link click handler
  $(".nav-link").click(function () {
    // Remove 'active' class from all nav-links
    $(".nav-link").removeClass("active");
    // Add 'active' class to clicked link
    $(this).addClass("active");

    // Hide all content sections
    $(".content-section").removeClass("active");

    // Show the targeted content section
    const target = $(this).data("target");
    $("#" + target).addClass("active");
  });
});

// =============== PRODUCT TABLE ===============
$(document).ready(function () {
  // Initialize DataTable with sorting only enabled for specific columns
  const table = $("#productTable").DataTable({
    responsive: true,
    pageLength: 10,
    dom: "Bfrtip",
    columnDefs: [{ orderable: false, targets: [1, 8, 9] }],
    buttons: {
      buttons: [
        {
          extend: "excelHtml5",
          className: "export-excel",
          title: "Product List",
          exportOptions: {
            modifier: {
              selected: true,
            },
          },
        },
        {
          extend: "pdfHtml5",
          className: "export-pdf",
          title: "Product List",
          exportOptions: {
            modifier: {
              selected: true,
            },
          },
        },
        {
          extend: "csvHtml5",
          className: "export-csv",
          title: "Product List",
          exportOptions: {
            modifier: {
              selected: true,
            },
          },
        },
      ],
      dom: {
        button: {
          className: "btn btn-primary btn-sm d-none",
        },
      },
    },
    select: {
      style: "multi",
    },
  });

  // Load products from JSON file and populate the table
  $.getJSON("data/products.json", function (data) {
    data.forEach((product) => {
      const statusBadge =
        product.quantity > 0
          ? '<span class="badge bg-success">In Stock</span>'
          : '<span class="badge bg-danger">Out of Stock</span>';
      const actions = `
        <div class="btn-group" role="group">
          <button class="btn btn-primary btn-sm" data-bs-toggle="tooltip" title="Edit this product">
            <i class="fa fa-pencil"></i>
          </button>
          <button class="btn btn-danger btn-sm" data-bs-toggle="tooltip" title="Delete this product">
            <i class="fa fa-trash"></i>
          </button>
        </div>`;
      table.row.add([
        product.id,
        `<img src="${product.image}" alt="${product.name}" class="img-thumbnail" style="width: 50px;" />`,
        product.name,
        `$${product.cost}`,
        product.tags.join(", "),
        product.description,
        product.quantity || 0,
        product.company,
        statusBadge,
        actions,
      ]).draw();
    });
  });

  // Search functionality for DataTable default search bar
  $("#searchBar-p").on("keyup", function () {
    const searchValue = this.value;
    table.search(searchValue).draw();
  });

  // Entries per page selection
  $("#showEntries-p").on("change", function () {
    const pageLength = $(this).val();
    table.page.len(pageLength).draw();
  });

  // Filter functionality: All, In Stock, Out of Stock
  $(".dropdown-menu").on("click", "a:contains('All')", function () {
    table.columns(8).search("").draw();
  });

  $(".dropdown-menu").on("click", "a:contains('In Stock')", function () {
    table.columns(8).search("In Stock").draw();
  });

  $(".dropdown-menu").on("click", "a:contains('Out of Stock')", function () {
    table.columns(8).search("Out of Stock").draw();
  });

  // Default filter to "All"
  table.columns(8).search("").draw();

  // Trigger Export Buttons from the Dropdown
  $(".export-btn-p").on("click", function (e) {
    e.preventDefault();
    const format = $(this).data("format");
    table.button(`.export-${format}`).trigger();
  });
});

// =============== PAYMENT TABLE ===============
$(document).ready(function () {
  // Initialize DataTable
  const table = $("#paymentsTable").DataTable({
    responsive: true,
    pageLength: 10,
    dom: "Bfrtip",
    columnDefs: [{ orderable: false, targets: [0, 1, 2, 4] }],
    buttons: {
      buttons: [
        {
          extend: "excelHtml5",
          className: "export-excel",
          title: "Payment List",
          exportOptions: { modifier: { selected: true } },
        },
        {
          extend: "pdfHtml5",
          className: "export-pdf",
          title: "Payment List",
          exportOptions: { modifier: { selected: true } },
        },
        {
          extend: "csvHtml5",
          className: "export-csv",
          title: "Payment List",
          exportOptions: { modifier: { selected: true } },
        },
      ],
    },
    select: { style: "multi" },
  });

  // Search functionality
  $("#searchBar-pay").on("keyup", function () {
    table.search(this.value).draw();
  });

  // Entries per page
  $("#showEntries-pay").on("change", function () {
    table.page.len($(this).val()).draw();
  });

  // Filter by status
  $(".dropdown-menu").on("click", "a", function () {
    const status = $(this).text();
    table
      .columns(5)
      .search(status === "All" ? "" : status)
      .draw();
  });

  // Export buttons
  $(".export-btnpay").on("click", function (e) {
    e.preventDefault();
    const format = $(this).data("format");
    table.button(`.export-${format}`).trigger();
  });
});

// =============== REPORT TABLE ===============
$(document).ready(function () {
  // Initialize DataTable
  const table = $("#reportTable").DataTable({
    responsive: true,
    pageLength: 10,
    dom: "Bfrtip",
    columnDefs: [{ orderable: false, targets: [2, 3,, 4, 5, 7] }],
    buttons: {
      buttons: [
        {
          extend: "excelHtml5",
          className: "export-excel",
          title: "Report List",
          exportOptions: { modifier: { selected: true } },
        },
        {
          extend: "pdfHtml5",
          className: "export-pdf",
          title: "Report List",
          exportOptions: { modifier: { selected: true } },
        },
        {
          extend: "csvHtml5",
          className: "export-csv",
          title: "Report List",
          exportOptions: { modifier: { selected: true } },
        },
      ],
    },
    select: { style: "multi" },
  });

  // Search functionality
  $("#searchBar-r").on("keyup", function () {
    table.search(this.value).draw();
  });

  // Entries per page
  $("#showEntries-r").on("change", function () {
    table.page.len($(this).val()).draw();
  });

  // Filter by status
  $(".dropdown-menu").on("click", "a", function () {
    const status = $(this).text();
    table
      .columns(5)
      .search(status === "All" ? "" : status)
      .draw();
  });

  // Export buttons
  $(".export-btn-r").on("click", function (e) {
    e.preventDefault();
    const format = $(this).data("format");
    table.button(`.export-${format}`).trigger();
  });
});

// =============== PRODUCT MODAL ===============
document.addEventListener("DOMContentLoaded", function () {
  // Reference the modal element

  const modalElement = document.getElementById("addProductModal");

  // Check if modal element exists before proceeding

  if (modalElement) {
    // Initialize Bootstrap's modal instance

    const modalInstance = new bootstrap.Modal(modalElement);

    // Reference the button that opens the modal
    const addProductBtn = document.getElementById("addProductBtn");

    if (addProductBtn) {
      // Add click event listener to the button
      addProductBtn.addEventListener("click", function () {
        // Show the modal
        modalInstance.show();
      });
    }

    // Ensure `aria-hidden` is handled properly when modal is shown/hidden
    modalElement.addEventListener("show.bs.modal", function () {
      modalElement.setAttribute("aria-hidden", "false");
    });

    modalElement.addEventListener("hidden.bs.modal", function () {
      modalElement.setAttribute("aria-hidden", "true");
    });
  } else {
    console.error("Modal element not found.");
  }

  // Image Drag-and-Drop and Browse functionality
  const dragDropArea = document.getElementById("dragDropArea");
  const browseLink = document.getElementById("browseLink");
  const fileInput = document.getElementById("productImage");

  // Enable browsing when the "Browse" link is clicked
  browseLink.addEventListener("click", function () {
    fileInput.click();
  });

  // Handle the file drop event
  dragDropArea.addEventListener("dragover", function (event) {
    event.preventDefault();
    dragDropArea.classList.add("bg-light");
  });

  dragDropArea.addEventListener("dragleave", function () {
    dragDropArea.classList.remove("bg-light");
  });

  dragDropArea.addEventListener("drop", function (event) {
    event.preventDefault();
    dragDropArea.classList.remove("bg-light");
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      fileInput.files = files;
      displayImage(files[0]);
    }
  });

  // Optional: Handle file selection via file input
  fileInput.addEventListener("change", function () {
    if (fileInput.files.length > 0) {
      displayImage(fileInput.files[0]);
    }
  });

  // Function to display the image as background with opacity
  function displayImage(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      // Set the background image of the drag-drop area
      dragDropArea.style.backgroundImage = `url(${e.target.result})`;
      dragDropArea.style.backgroundSize = "cover";
      dragDropArea.style.backgroundPosition = "center";
      dragDropArea.style.opacity = "0.5";
    };
    reader.readAsDataURL(file);
  }
});

// =============== CREDITS MODAL ===============
$(document).ready(function () {
  const table = $("#creditsTable").DataTable({
      responsive: true,
      pageLength: 10,
      dom: "Bfrtip",
      columnDefs: [{ orderable: false, targets: [3, 4] }],
  });

  $("#searchBar-c").on("keyup", function () {
      table.search(this.value).draw();
  });

  $("#showEntries-c").on("change", function () {
      table.page.len($(this).val()).draw();
  });

  $("#addContributorBtn").on("click", function () {
      const modal = new bootstrap.Modal("#addContributorModal");
      modal.show();
  });

  $("#addContributorForm").on("submit", function (e) {
      e.preventDefault();
      const name = $("#contributorName").val();
      const role = $("#contributorRole").val();
      const social = $("#contributorSocial").val();

      table.row.add([
          table.rows().count() + 1,
          name,
          role,
          `<a href="${social}" target="_blank" class="btn btn-link">Link</a>`,
          `<div class="btn-group">
              <button class="btn btn-primary btn-sm"><i class="fa fa-pencil"></i></button>
              <button class="btn btn-danger btn-sm"><i class="fa fa-trash"></i></button>
           </div>`,
      ]).draw(false);

      const modal = bootstrap.Modal.getInstance("#addContributorModal");
      modal.hide();
  });
});

// =============== HOLIDAY MODAL ===============
$(document).ready(function () {
  const holidayTable = $("#holidayTable").DataTable();

  // Handle Add/Edit Holiday Modal Submission
  $("#holidayForm").on("submit", function (e) {
      e.preventDefault();

      const date = $("#holidayDate").val();
      const reason = $("#holidayReason").val();
      const timings = $("#shopTimings").val();

      const day = new Date(date).toLocaleDateString("en-US", { weekday: "long" });

      holidayTable.row
          .add([
              holidayTable.rows().count() + 1, // ID
              new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }), // Date
              day, // Day
              reason, // Reason
              timings, // Shop Timings
              `<button class="btn btn-primary btn-sm edit-btn"><i class="fa fa-pencil"></i></button>
               <button class="btn btn-danger btn-sm delete-btn"><i class="fa fa-trash"></i></button>`, // Actions
          ])
          .draw();

      $("#addHolidayModal").modal("hide");
      $("#holidayForm")[0].reset();
  });

  // Handle Delete Button
  $("#holidayTable").on("click", ".delete-btn", function () {
      holidayTable.row($(this).closest("tr")).remove().draw();
  });

  // Pre-fill modal for editing
  $("#holidayTable").on("click", ".edit-btn", function () {
      const row = holidayTable.row($(this).closest("tr")).data();

      $("#holidayDate").val(new Date(row[1]).toISOString().split("T")[0]);
      $("#holidayReason").val(row[3]);
      $("#shopTimings").val(row[4]);

      $("#addHolidayModal").modal("show");
  });
});

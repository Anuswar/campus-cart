$(document).ready(function () {
    const grandTotal = localStorage.getItem("grandTotal");

    if (grandTotal) {
        $("#amount-paid").text(` ₹${parseFloat(grandTotal).toFixed(2)}`);
    } else {
        $("#amount-paid").text(" ₹0.00");
    }
});

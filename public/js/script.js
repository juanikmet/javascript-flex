// Cargar productos desde un archivo JSON
let products = [];

async function loadProducts() {
  try {
    const response = await fetch('http://localhost:3000/js/products.json');
    if (!response.ok) {
      throw new Error('Error al cargar los productos.');
    }
    products = await response.json();
    updateCart();
  } catch (error) {
    showAlert('Error al cargar los productos. Inténtelo nuevamente más tarde.');
  }
}

function showAlert(message) {
  alert(message);
}

// Función para actualizar el carrito de compras
function updateCart() {
  const productContainer = document.getElementById("productContainer");
  productContainer.innerHTML = ""; // Limpiar el contenedor antes de rellenarlo nuevamente

  // Recorrer los productos y crear elementos para mostrarlos
  products.forEach((product, index) => {
    const productElement = document.createElement("div");
    productElement.classList.add("product");

    const imgElement = document.createElement("img");
    imgElement.src = `../${product.imagen}`;
    imgElement.alt = product.nombre;
    productElement.appendChild(imgElement);

    const nameElement = document.createElement("p");
    nameElement.textContent = product.nombre;
    productElement.appendChild(nameElement);

    const priceElement = document.createElement("p");
    priceElement.textContent = `$${product.precio.toFixed(2)}`;
    productElement.appendChild(priceElement);

    const stockElement = document.createElement("p"); // Elemento para mostrar el stock
    stockElement.textContent = `Stock: ${product.stock}`;
    productElement.appendChild(stockElement);

    const addButton = document.createElement("button");
    addButton.textContent = "Agregar al carrito";
    addButton.addEventListener("click", () => addToCart(index));
    productElement.appendChild(addButton);

    productContainer.appendChild(productElement);
  });
}
// Función para agregar producto al carrito
function addToCart(index) {
  try {
    if (products[index].stock > 0) {
      products[index].stock--;
      updateCart();
      updateCartSummary(); // Actualizar el resumen del carrito
      saveCartToLocalStorage();
    } else {
      showAlert("Producto sin stock");
    }
  } catch (error) {
    showAlert('Error al agregar el producto al carrito. Inténtelo nuevamente.');
  }
}

// Función para eliminar producto del carrito
function removeFromCart(index) {
  try {
    if (products[index].stock < 5) {
      products[index].stock++;
      updateCart();
      updateCartSummary();
      saveCartToLocalStorage();
    }
  } catch (error) {
    showAlert('Error al eliminar el producto del carrito. Inténtelo nuevamente.');
  }
}

// Función para vaciar el carrito
function emptyCart() {
  try {
    products.forEach((product) => {
      product.stock = 5;
    });
    updateCart();
    updateCartSummary();
    saveCartToLocalStorage();
  } catch (error) {
    showAlert('Error al vaciar el carrito. Inténtelo nuevamente.');
  }
}
// Función para actualizar el resumen del carrito y el valor total
function updateCartSummary() {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  let totalPrice = 0;

  // Limpiar el contenido del resumen del carrito
  cartItems.innerHTML = "";

  // Recorrer los productos en el carrito
  products.forEach((product, index) => {
    if (product.stock < 5) {
      let li = document.createElement("li");
      li.textContent = `${product.nombre} - $${product.precio.toFixed(2)}`;
      let removeButton = document.createElement("button");
      removeButton.textContent = "Eliminar";
      removeButton.addEventListener("click", () => removeFromCart(index));
      li.appendChild(removeButton);
      cartItems.appendChild(li);
      totalPrice += product.precio;
    }
  });

  // Actualizar el valor total del carrito
  cartTotal.textContent = `Total: $${totalPrice.toFixed(2)}`;
}

// Función para guardar el carrito en el Local Storage
function saveCartToLocalStorage() {
  localStorage.setItem("cart", JSON.stringify(products));
}

// Función para cargar el carrito desde el Local Storage
function loadCartFromLocalStorage() {
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    products = JSON.parse(savedCart);
    updateCart();
    updateCartSummary(); // Actualizar el resumen del carrito
  }
}

// Evento para abrir el modal del carrito
document.getElementById("cartBtn").addEventListener("click", () => {
  const modal = document.getElementById("cartModal");
  modal.style.display = "block";
});

// Evento para cerrar el modal del carrito
document.getElementsByClassName("close")[0].addEventListener("click", () => {
  const modal = document.getElementById("cartModal");
  modal.style.display = "none";
});

// Evento para vaciar el carrito
document.getElementById("emptyCartBtn").addEventListener("click", () => {
  emptyCart();
});

// Evento para pagar el carrito
document.getElementById("checkoutBtn").addEventListener("click", () => {
  const paymentModal = document.getElementById("paymentModal");
  paymentModal.style.display = "block";
  updatePaymentSummary();
});

// Evento para cerrar el modal de pago
document.getElementsByClassName("close-payment")[0].addEventListener("click", () => {
  const paymentModal = document.getElementById("paymentModal");
  paymentModal.style.display = "none";
});

// Función para actualizar el resumen de pago
function updatePaymentSummary() {
  const paymentSummary = document.getElementById("paymentSummary");
  let totalPrice = 0;

  paymentSummary.innerHTML = "";

  products.forEach((product) => {
    if (product.stock < 5) {
      let li = document.createElement("li");
      li.textContent = `${product.nombre} - $${product.precio.toFixed(2)}`;
      paymentSummary.appendChild(li);
      totalPrice += product.precio;
    }
  });

  const totalElement = document.createElement("p");
  totalElement.textContent = `Total a pagar: $${totalPrice.toFixed(2)}`;
  paymentSummary.appendChild(totalElement);
}

// Evento para procesar el pago
document.getElementById("confirmPaymentBtn").addEventListener("click", () => {
  try {
    const name = document.getElementById("customerName").value;
    const email = document.getElementById("customerEmail").value;

    if (!name || !email) {
      throw new Error('Por favor, complete todos los campos.');
    }

    const customerData = { name, email };
    saveCustomerDataToJson(customerData);

    showAlert('¡Gracias por su compra!');
    localStorage.removeItem("cart");
    emptyCart();
    const paymentModal = document.getElementById("paymentModal");
    paymentModal.style.display = "none";
  } catch (error) {
    showAlert('Error al procesar el pago. Inténtelo nuevamente.');
  }
});

// Función para guardar los datos del cliente en un archivo JSON
function saveCustomerDataToJson(customerData) {
  try {
    const jsonData = JSON.stringify(customerData);
    localStorage.setItem("customerData", jsonData); // Guardar los datos en el Local Storage
    showAlertInPaymentModal('¡Gracias por su compra!'); // Mostrar el mensaje de éxito dentro del modal de pago
  } catch (error) {
    showAlertInPaymentModal('Error al guardar los datos del cliente. Inténtelo nuevamente.');
  }
}

// Función para mostrar un mensaje de alerta dentro del modal de pago
function showAlertInPaymentModal(message) {
  const paymentModal = document.getElementById("paymentModal");
  const alertElement = document.createElement("p");
  alertElement.textContent = message;
  alertElement.classList.add("alert");
  paymentModal.appendChild(alertElement);
  setTimeout(() => {
    alertElement.remove(); // Eliminar el mensaje después de unos segundos
  }, 3000);
}

// Cargar el carrito al cargar la página
loadCartFromLocalStorage();
loadProducts();

// Actualizar el carrito al cargar la página
updateCart();
updateCartSummary(); // Actualizar el resumen del carrito

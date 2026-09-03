const bar = document.getElementById("bar");
const close = document.getElementById("close");
const nav = document.getElementById("navbar");

if (bar) {
  bar.addEventListener("click", () => {
    nav.classList.add("active");
  });
}

if (close) {
  close.addEventListener("click", (e) => {
    e.preventDefault();
    nav.classList.remove("active");
  });
}

const mainImg = document.getElementById("MainImg");
const smallImgs = document.querySelectorAll(".small-img");

if (mainImg && smallImgs.length) {
  smallImgs.forEach((img) => {
    img.addEventListener("click", () => {
      mainImg.src = img.src;
      smallImgs.forEach((item) => item.classList.remove("active-thumb"));
      img.classList.add("active-thumb");
    });
  });
}

const CART_KEY = "cara_cart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function formatPrice(price) {
  return `Rs ${Number(price).toFixed(0)}`;
}

function updateCartCount() {
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCounters = document.querySelectorAll("[data-cart-count]");

  cartCounters.forEach((counter) => {
    counter.textContent = totalQty;
  });
}

function addToCart(product) {
  const cart = getCart();

  const existingItem = cart.find(
    (item) => item.id === product.id && item.size === product.size
  );

  if (existingItem) {
    existingItem.quantity += product.quantity;
  } else {
    cart.push(product);
  }

  saveCart(cart);
  alert(`${product.name} added to cart`);
}

function removeFromCart(id, size) {
  const cart = getCart().filter(
    (item) => !(item.id === id && item.size === size)
  );
  saveCart(cart);
  renderCartItems();
}

function updateCartItemQuantity(id, size, quantity) {
  const cart = getCart();
  const item = cart.find((product) => product.id === id && product.size === size);

  if (!item) return;

  if (quantity <= 0) {
    removeFromCart(id, size);
    return;
  }

  item.quantity = quantity;
  saveCart(cart);
  renderCartItems();
}

function renderCartItems() {
  const cartBody = document.getElementById("cart-body");
  const subtotalEl = document.getElementById("cart-subtotal");
  const discountEl = document.getElementById("cart-discount");
  const totalEl = document.getElementById("cart-total");

  if (!cartBody || !subtotalEl || !discountEl || !totalEl) return;

  const cart = getCart();

  if (!cart.length) {
    cartBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:30px; color:#465b52;">
          Your cart is empty. <a href="shop.html" style="color:#088178; font-weight:700;">Continue shopping</a>
        </td>
      </tr>
    `;
    subtotalEl.textContent = "Rs 0";
    discountEl.textContent = "Rs 0";
    totalEl.textContent = "Rs 0";
    return;
  }

  let subtotal = 0;

  cartBody.innerHTML = cart
    .map((item) => {
      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;

      return `
        <tr>
          <td>
            <a href="#" class="remove-item" data-id="${item.id}" data-size="${item.size}">
              <i class="far fa-times-circle"></i>
            </a>
          </td>
          <td>
            <img src="${item.image}" alt="${item.name}" />
          </td>
          <td>${item.name} ${item.size ? `(${item.size})` : ""}</td>
          <td>${formatPrice(item.price)}</td>
          <td>
            <input
              type="number"
              min="1"
              value="${item.quantity}"
              class="cart-qty"
              data-id="${item.id}"
              data-size="${item.size}"
            />
          </td>
          <td>${formatPrice(itemSubtotal)}</td>
        </tr>
      `;
    })
    .join("");

  const discount = subtotal >= 3000 ? 200 : 0;
  const total = subtotal - discount;

  subtotalEl.textContent = formatPrice(subtotal);
  discountEl.textContent = formatPrice(discount);
  totalEl.textContent = formatPrice(total);

  document.querySelectorAll(".remove-item").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      removeFromCart(button.dataset.id, button.dataset.size);
    });
  });

  document.querySelectorAll(".cart-qty").forEach((input) => {
    input.addEventListener("change", () => {
      const quantity = parseInt(input.value, 10);
      updateCartItemQuantity(input.dataset.id, input.dataset.size, quantity);
    });
  });
}

function setupProductButtons() {
  const buttons = document.querySelectorAll("[data-add-to-cart]");

  buttons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();

      const product = {
        id: button.dataset.id,
        name: button.dataset.name,
        price: Number(button.dataset.price),
        image: button.dataset.image,
        size: button.dataset.size || "M",
        quantity: Number(button.dataset.quantity) || 1,
      };

      addToCart(product);
    });
  });
}

function setupSingleProductPage() {
  const addButton = document.getElementById("single-add-to-cart");
  if (!addButton) return;

  addButton.addEventListener("click", () => {
    const nameEl = document.getElementById("single-product-name");
    const priceEl = document.getElementById("single-product-price");
    const quantityEl = document.getElementById("single-quantity");
    const sizeEl = document.getElementById("single-size");
    const imageEl = document.getElementById("MainImg");

    const selectedSize = sizeEl ? sizeEl.value : "M";
    const finalSize =
      !selectedSize || selectedSize.toLowerCase().includes("select")
        ? "M"
        : selectedSize;

    const product = {
      id: addButton.dataset.id || "single-f1",
      name: nameEl ? nameEl.textContent.trim() : "Product",
      price: Number(addButton.dataset.price || priceEl?.dataset.price || 1000),
      image: imageEl ? imageEl.src : "img/products/f1.jpg",
      size: finalSize,
      quantity: Math.max(1, Number(quantityEl ? quantityEl.value : 1)),
    };

    addToCart(product);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  setupProductButtons();
  setupSingleProductPage();
  renderCartItems();
});
// Shopping cart data
const cart = {
  items: [],
  nextId: 1,

  // Add an item to the cart
  addItem(name, price, quantity) {
    const item = {
      id: this.nextId++,
      name,
      price,
      quantity,
      subtotal: price * quantity,
    };
    this.items.push(item);
    return item;
  },

  // Remove an item by id
  removeItem(id) {
    const index = this.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  },

  // Calculate the total of all items
  getTotal() {
    return this.items.reduce((sum, item) => sum + item.subtotal, 0);
  },
};

const EMPTY_CART_MESSAGE = "O carrinho está vazio.";

// Format a value as Brazilian currency (e.g. 1234.5 → "R$ 1.234,50")
const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatCurrency(value) {
  return currencyFormatter.format(value);
}

// Helper to create a text-only <td> (prevents XSS from user-supplied values)
function createTextCell(text) {
  const td = document.createElement("td");
  td.textContent = text;
  return td;
}

// Helper to clear all children from a DOM element
function clearChildren(el) {
  el.replaceChildren();
}

// Re-render the cart table and total
function renderCart() {
  const container = document.getElementById("cartContainer");
  const totalDiv = document.getElementById("cartTotal");
  const totalSpan = document.getElementById("totalValue");

  if (cart.items.length === 0) {
    const p = document.createElement("p");
    p.className = "cart-empty";
    p.textContent = EMPTY_CART_MESSAGE;
    clearChildren(container);
    container.appendChild(p);
    totalDiv.style.display = "none";
    return;
  }

  // Build table via DOM (avoids inline event handlers and XSS risks)
  const table = document.createElement("table");

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["Produto", "Preço Unit.", "Qtd", "Subtotal", "Ação"].forEach((label) => {
    const th = document.createElement("th");
    th.textContent = label;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  cart.items.forEach((item) => {
    const tr = document.createElement("tr");

    tr.appendChild(createTextCell(item.name));
    tr.appendChild(createTextCell(formatCurrency(item.price)));
    tr.appendChild(createTextCell(String(item.quantity)));
    tr.appendChild(createTextCell(formatCurrency(item.subtotal)));

    const actionTd = document.createElement("td");
    const btn = document.createElement("button");
    btn.className = "btn-remove";
    btn.textContent = "Remover";
    btn.addEventListener("click", () => removeItem(item.id));
    actionTd.appendChild(btn);
    tr.appendChild(actionTd);

    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  clearChildren(container);
  container.appendChild(table);

  totalSpan.textContent = formatCurrency(cart.getTotal());
  totalDiv.style.display = "block";
}

// Add item from the form inputs
function addItem() {
  const nameInput = document.getElementById("productName");
  const priceInput = document.getElementById("productPrice");
  const qtyInput = document.getElementById("productQty");

  const name = nameInput.value.trim();
  const price = parseFloat(priceInput.value);
  const qtyRaw = qtyInput.value;
  const quantity = parseInt(qtyRaw, 10);

  if (!name) {
    alert("Por favor, informe o nome do produto.");
    return;
  }
  if (isNaN(price) || price <= 0) {
    alert("Por favor, informe um preço válido.");
    return;
  }
  if (isNaN(quantity) || quantity <= 0 || qtyRaw.includes(".") || qtyRaw.includes(",")) {
    alert("Por favor, informe uma quantidade válida (número inteiro positivo).");
    return;
  }

  cart.addItem(name, price, quantity);
  renderCart();

  // Reset form fields
  nameInput.value = "";
  priceInput.value = "";
  qtyInput.value = "1";
}

// Remove item by id and re-render
function removeItem(id) {
  cart.removeItem(id);
  renderCart();
}

// Attach the addItem handler via addEventListener (avoids inline onclick in HTML)
document.addEventListener("DOMContentLoaded", () => {
  // Render the initial (empty) cart state
  renderCart();

  document.querySelector(".btn-add").addEventListener("click", addItem);

  // Allow pressing Enter in any input field to trigger addItem
  ["productName", "productPrice", "productQty"].forEach((id) => {
    document.getElementById(id).addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addItem();
      }
    });
  });
});

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

// Format a number as Brazilian currency (e.g. 1234.5 → "1.234,50")
const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatCurrency(value) {
  return currencyFormatter.format(value);
}

// Re-render the cart table and total
function renderCart() {
  const container = document.getElementById("cartContainer");
  const totalDiv = document.getElementById("cartTotal");
  const totalSpan = document.getElementById("totalValue");

  if (cart.items.length === 0) {
    container.innerHTML = '<p class="cart-empty">O carrinho está vazio.</p>';
    totalDiv.style.display = "none";
    return;
  }

  // Build table via DOM (avoids inline event handlers and XSS risks)
  const table = document.createElement("table");

  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th>Produto</th>
      <th>Preço Unit.</th>
      <th>Qtd</th>
      <th>Subtotal</th>
      <th>Ação</th>
    </tr>`;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  cart.items.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>R$ ${formatCurrency(item.price)}</td>
      <td>${item.quantity}</td>
      <td>R$ ${formatCurrency(item.subtotal)}</td>
      <td></td>`;

    const btn = document.createElement("button");
    btn.className = "btn-remove";
    btn.textContent = "Remover";
    btn.addEventListener("click", () => removeItem(item.id));
    tr.querySelector("td:last-child").appendChild(btn);

    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  container.innerHTML = "";
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
  const quantity = parseInt(qtyInput.value, 10);

  if (!name) {
    alert("Por favor, informe o nome do produto.");
    return;
  }
  if (isNaN(price) || price <= 0) {
    alert("Por favor, informe um preço válido.");
    return;
  }
  if (isNaN(quantity) || quantity <= 0) {
    alert("Por favor, informe uma quantidade válida.");
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
  document.querySelector(".btn-add").addEventListener("click", addItem);
});

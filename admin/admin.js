/* =========================================================
   SHIKADEAL ADMIN
   PRODUCTS MANAGEMENT (INTEGRATED WITH GITHUB & CACHE BUSTING)
========================================================= */

/* =========================================================
   GLOBAL STATE
========================================================= */
let products = [];
let editingIndex = null;
let hasUnsavedChanges = false;
const WORKER_URL = 'https://workers.dev';

/* =========================================================
   ELEMENTS
========================================================= */
const productList = document.getElementById('product-list');
const productEditor = document.getElementById('product-editor');
const productForm = document.getElementById('product-form');
const editorTitle = document.getElementById('editor-title');
const imageFields = document.getElementById('image-fields');
const productName = document.getElementById('product-name');
const productStatus = document.getElementById('product-status');
const productCondition = document.getElementById('product-condition');
const productPrice = document.getElementById('product-price');
const productDescription = document.getElementById('product-description');
const addProductButton = document.getElementById('add-product');
const addImageButton = document.getElementById('add-image');
const cancelProductButton = document.getElementById('cancel-product');
const closeEditorButton = document.getElementById('close-editor');

/* =========================================================
   LOAD PRODUCTS
========================================================= */
async function loadProducts(){
  try {
    // Cache bust using query timestamp to prevent old JSON states
    const response = await fetch(`../data/products.json?v=${Date.now()}`, {
      cache: 'no-store'
    });

    if(!response.ok){
      throw new Error('Could not load products.json');
    }

    const data = await response.json();

    if(!Array.isArray(data)){
      throw new Error('products.json must contain an array');
    }

    products = data.map(product => {
      // Robust clean-up logic to convert string pricing like "KSh 48,500" into clean numbers inside the app
      let rawPrice = product.price;
      if (typeof rawPrice === 'string') {
        rawPrice = rawPrice.replace(/KSh\s?|,/gi, '').trim();
      }
      const parsedPrice = parseInt(rawPrice, 10);

      return {
        name: product.name || '',
        status: product.status || 'available',
        condition: product.condition || '',
        price: isNaN(parsedPrice) ? '' : parsedPrice,
        description: product.description || '',
        images: Array.isArray(product.images) ? [...product.images] : []
      };
    });

    renderProducts();
    updateStats();

  } catch(error) {
    console.error(error);
    productList.innerHTML = `
      <div class="loading-card">
        <strong>Unable to load products.</strong>
        <br><br>
        Check that <code>data/products.json</code> exists and contains valid JSON.
      </div>
    `;
  }
}

/* =========================================================
   RENDER PRODUCT LIST
========================================================= */
function renderProducts(){
  productList.innerHTML = '';

  if(products.length === 0){
    productList.innerHTML = `
      <div class="loading-card">
        No products yet. Click <strong>+ Add Product</strong> to create your first listing.
      </div>
    `;
    return;
  }

  products.forEach((product, index) => {
    const row = document.createElement('div');
    row.className = 'product-row';

    /* IMAGE */
    const firstImage = product.images && product.images.length ? product.images[0] : '';
    if(firstImage){
      const image = document.createElement('img');
      image.className = 'product-thumbnail';
      image.src = getImagePath(firstImage);
      image.alt = product.name;
      image.onerror = () => {
        image.replaceWith(createPlaceholder());
      };
      row.appendChild(image);
    } else {
      row.appendChild(createPlaceholder());
    }

    /* NAME */
    const name = document.createElement('div');
    name.className = 'product-row-name';

    const strong = document.createElement('strong');
    strong.textContent = product.name || 'Untitled Product';

    const small = document.createElement('small');
    small.textContent = product.condition || 'No condition specified';

    name.appendChild(strong);
    name.appendChild(small);
    row.appendChild(name);

    /* PRICE */
    const price = document.createElement('div');
    price.className = 'product-row-price';
    price.textContent = formatPrice(product.price);
    row.appendChild(price);

    /* STATUS */
    const status = document.createElement('span');
    status.className = `product-status status-${product.status}`;
    status.textContent = getStatusLabel(product.status);
    row.appendChild(status);

    /* ACTIONS */
    const actions = document.createElement('div');
    actions.className = 'product-row-actions';

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'small-button';
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => {
      openEditor(index);
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'small-button delete';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
      deleteProduct(index);
    });

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    row.appendChild(actions);

    productList.appendChild(row);
  });
}

/* =========================================================
   UTILITIES & FORMATTERS
========================================================= */
function createPlaceholder(){
  const placeholder = document.createElement('div');
  placeholder.className = 'product-thumbnail-placeholder';
  placeholder.textContent = 'NO IMAGE';
  return placeholder;
}

function getImagePath(path){
  if(!path) return '';
  if(path.startsWith('http://') || path.startsWith('https://') || path.startsWith('../')){
    return path;
  }
  return '../' + path;
}

function formatPrice(price){
  if(price === undefined || price === null || price === '') return '';
  const number = Number(price);
  if(isNaN(number)) return String(price);
  return 'KSh ' + number.toLocaleString('en-KE');
}

function getStatusLabel(status){
  if(status === 'sold') return 'SOLD';
  if(status === 'reserved') return 'RESERVED';
  return 'AVAILABLE';
}

function updateStats(){
  document.getElementById('product-count').textContent = products.length;
  document.getElementById('available-count').textContent = products.filter(p => p.status === 'available').length;
  document.getElementById('reserved-count').textContent = products.filter(p => p.status === 'reserved').length;
  document.getElementById('sold-count').textContent = products.filter(p => p.status === 'sold').length;
}

/* =========================================================
   OPEN / CLOSE EDITOR
========================================================= */
function openEditor(index = null){
  editingIndex = index;
  imageFields.innerHTML = '';

  if(index === null){
    editorTitle.textContent = 'Add Product';
    productForm.reset();
    productStatus.value = 'available';
    addImageField('');
  } else {
    const product = products[index];
    editorTitle.textContent = 'Edit Product';
    productName.value = product.name || '';
    productStatus.value = product.status || 'available';
    productCondition.value = product.condition || '';
    productPrice.value = product.price ?? '';
    productDescription.value = product.description || '';

    if(product.images && product.images.length){
      product.images.forEach(image => addImageField(image));
    } else {
      addImageField('');
    }
  }

  productEditor.hidden = false;
  productEditor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  hasUnsavedChanges = false;
}

function closeEditor(){
  if(hasUnsavedChanges){
    const confirmed = confirm('You have unsaved changes. Close anyway?');
    if(!confirmed) return;
  }
  productEditor.hidden = true;
  editingIndex = null;
  hasUnsavedChanges = false;
}

/* =========================================================
   IMAGE DYNAMIC FORM FIELDS
========================================================= */
function addImageField(value = ''){
  const wrapper = document.createElement('div');
  wrapper.className = 'image-field';

  const preview = document.createElement('img');
  preview.className = 'image-preview';
  preview.alt = 'Image preview';
  if(value) preview.src = getImagePath(value);
  preview.onerror = () => preview.removeAttribute('src');
  wrapper.appendChild(preview);

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'image-input';
  input.placeholder = 'images/products/example.jpg';
  input.value = value;
  input.addEventListener('input', () => {
    hasUnsavedChanges = true;
    if(input.value.trim()){
      preview.src = getImagePath(input.value.trim());
    } else {
      preview.removeAttribute('src');
    }
  });
  wrapper.appendChild(input);

  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = 'remove-image';
  removeButton.textContent = '×';
  removeButton.addEventListener('click', () => {
    wrapper.remove();
    hasUnsavedChanges = true;
  });
  wrapper.appendChild(removeButton);

  imageFields.appendChild(wrapper);
}

function getImagesFromForm(){
  return Array.from(imageFields.querySelectorAll('.image-input'))
    .map(input => input.value.trim())
    .filter(value => value !== '');
}

/* =========================================================

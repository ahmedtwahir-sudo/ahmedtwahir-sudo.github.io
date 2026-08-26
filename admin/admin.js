/* =========================================================
   SHIKADEAL ADMIN
   PRODUCTS MANAGEMENT
========================================================= */


/* =========================================================
   GLOBAL STATE
========================================================= */

let products = [];

let editingIndex = null;

let hasUnsavedChanges = false;


/* =========================================================
   ELEMENTS
========================================================= */

const productList =
  document.getElementById('product-list');

const productEditor =
  document.getElementById('product-editor');

const productForm =
  document.getElementById('product-form');

const editorTitle =
  document.getElementById('editor-title');

const imageFields =
  document.getElementById('image-fields');

const productName =
  document.getElementById('product-name');

const productStatus =
  document.getElementById('product-status');

const productCondition =
  document.getElementById('product-condition');

const productPrice =
  document.getElementById('product-price');

const productDescription =
  document.getElementById('product-description');

const addProductButton =
  document.getElementById('add-product-button');

const addImageButton =
  document.getElementById('add-image-button');

const cancelProductButton =
  document.getElementById('cancel-product');

const closeEditorButton =
  document.getElementById('close-editor');


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts(){

  try{

    const response =
      await fetch('../data/products.json');


    if(!response.ok){

      throw new Error(
        'Could not load products.json'
      );

    }


    const data =
      await response.json();


    if(!Array.isArray(data)){

      throw new Error(
        'products.json must contain an array'
      );

    }


    products =
      data.map(product => ({
        name:
          product.name || '',

        status:
          product.status || 'available',

        condition:
          product.condition || '',

        price:
          product.price ?? '',

        description:
          product.description || '',

        images:
          Array.isArray(product.images)
            ? [...product.images]
            : []
      }));


    renderProducts();

    updateStats();


  }catch(error){

    console.error(error);


    productList.innerHTML = `
      <div class="loading-card">
        <strong>Unable to load products.</strong>
        <br><br>
        Check that
        <code>data/products.json</code>
        exists and contains valid JSON.
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
        No products yet.
        Click <strong>+ Add Product</strong>
        to create your first listing.
      </div>
    `;

    return;

  }


  products.forEach(
    (product,index) => {

      const row =
        document.createElement('div');

      row.className =
        'product-row';


      /* IMAGE */

      const firstImage =
        product.images &&
        product.images.length
          ? product.images[0]
          : '';


      if(firstImage){

        const image =
          document.createElement('img');

        image.className =
          'product-thumbnail';

        image.src =
          getImagePath(firstImage);

        image.alt =
          product.name;

        image.onerror =
          () => {

            image.replaceWith(
              createPlaceholder()
            );

          };

        row.appendChild(image);

      }else{

        row.appendChild(
          createPlaceholder()
        );

      }


      /* NAME */

      const name =
        document.createElement('div');

      name.className =
        'product-row-name';


      const strong =
        document.createElement('strong');

      strong.textContent =
        product.name ||
        'Untitled Product';


      const small =
        document.createElement('small');

      small.textContent =
        product.condition ||
        'No condition specified';


      name.appendChild(strong);

      name.appendChild(small);

      row.appendChild(name);


      /* PRICE */

      const price =
        document.createElement('div');

      price.className =
        'product-row-price';

      price.textContent =
        formatPrice(product.price);

      row.appendChild(price);


      /* STATUS */

      const status =
        document.createElement('span');

      status.className =
        `product-status status-${product.status}`;

      status.textContent =
        getStatusLabel(product.status);

      row.appendChild(status);


      /* ACTIONS */

      const actions =
        document.createElement('div');

      actions.className =
        'product-row-actions';


      const editButton =
        document.createElement('button');

      editButton.type =
        'button';

      editButton.className =
        'small-button';

      editButton.textContent =
        'Edit';

      editButton.addEventListener(
        'click',
        () => {

          openEditor(index);

        }
      );


      const deleteButton =
        document.createElement('button');

      deleteButton.type =
        'button';

      deleteButton.className =
        'small-button delete';

      deleteButton.textContent =
        'Delete';

      deleteButton.addEventListener(
        'click',
        () => {

          deleteProduct(index);

        }
      );


      actions.appendChild(
        editButton
      );

      actions.appendChild(
        deleteButton
      );


      row.appendChild(actions);


      productList.appendChild(row);

    }
  );

}


/* =========================================================
   IMAGE PLACEHOLDER
========================================================= */

function createPlaceholder(){

  const placeholder =
    document.createElement('div');

  placeholder.className =
    'product-thumbnail-placeholder';

  placeholder.textContent =
    'NO IMAGE';

  return placeholder;

}


/* =========================================================
   IMAGE PATH
========================================================= */

function getImagePath(path){

  if(!path){
    return '';
  }


  /*
    Existing products.json paths such as:

    images/products/hp440-1.jpg

    are relative to the public site's root.

    The admin page is inside /admin/,
    so we add ../ here.
  */

  if(
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('../')
  ){

    return path;

  }


  return '../' + path;

}


/* =========================================================
   FORMAT PRICE
========================================================= */

function formatPrice(price){

  if(
    price === undefined ||
    price === null ||
    price === ''
  ){

    return '';

  }


  const number =
    Number(price);


  if(Number.isNaN(number)){

    return String(price);

  }


  return 'KSh ' +
    number.toLocaleString('en-KE');

}


/* =========================================================
   STATUS LABEL
========================================================= */

function getStatusLabel(status){

  if(status === 'sold'){
    return 'SOLD';
  }

  if(status === 'reserved'){
    return 'RESERVED';
  }

  return 'AVAILABLE';

}


/* =========================================================
   UPDATE DASHBOARD STATS
========================================================= */

function updateStats(){

  const productCount =
    document.getElementById('product-count');

  const availableCount =
    document.getElementById('available-count');

  const reservedCount =
    document.getElementById('reserved-count');

  const soldCount =
    document.getElementById('sold-count');


  productCount.textContent =
    products.length;


  availableCount.textContent =
    products.filter(
      product =>
        product.status === 'available'
    ).length;


  reservedCount.textContent =
    products.filter(
      product =>
        product.status === 'reserved'
    ).length;


  soldCount.textContent =
    products.filter(
      product =>
        product.status === 'sold'
    ).length;

}


/* =========================================================
   OPEN EDITOR
========================================================= */

function openEditor(index = null){

  editingIndex =
    index;


  imageFields.innerHTML =
    '';


  if(index === null){

    editorTitle.textContent =
      'Add Product';


    productForm.reset();


    productStatus.value =
      'available';


    addImageField('');


  }else{

    const product =
      products[index];


    editorTitle.textContent =
      'Edit Product';


    productName.value =
      product.name || '';


    productStatus.value =
      product.status || 'available';


    productCondition.value =
      product.condition || '';


    productPrice.value =
      product.price ?? '';


    productDescription.value =
      product.description || '';


    if(
      product.images &&
      product.images.length
    ){

      product.images.forEach(
        image => {

          addImageField(image);

        }
      );

    }else{

      addImageField('');

    }

  }


  productEditor.hidden =
    false;


  productEditor.scrollIntoView({
    behavior:'smooth',
    block:'start'
  });


  hasUnsavedChanges =
    false;

}


/* =========================================================
   CLOSE EDITOR
========================================================= */

function closeEditor(){

  if(hasUnsavedChanges){

    const confirmed =
      confirm(
        'You have unsaved changes. Close anyway?'
      );


    if(!confirmed){
      return;
    }

  }


  productEditor.hidden =
    true;

  editingIndex =
    null;

  hasUnsavedChanges =
    false;

}


/* =========================================================
   ADD IMAGE FIELD
========================================================= */

function addImageField(value = ''){

  const wrapper =
    document.createElement('div');

  wrapper.className =
    'image-field';


  /* PREVIEW */

  const preview =
    document.createElement('img');

  preview.className =
    'image-preview';

  preview.alt =
    'Image preview';


  if(value){

    preview.src =
      getImagePath(value);

  }


  preview.onerror =
    () => {

      preview.removeAttribute(
        'src'
      );

    };


  wrapper.appendChild(
    preview
  );


  /* INPUT */

  const input =
    document.createElement('input');

  input.type =
    'text';

  input.className =
    'image-input';

  input.placeholder =
    'images/products/example.jpg';

  input.value =
    value;


  input.addEventListener(
    'input',
    () => {

      hasUnsavedChanges =
        true;


      if(input.value.trim()){

        preview.src =
          getImagePath(
            input.value.trim()
          );

      }else{

        preview.removeAttribute(
          'src'
        );

      }

    }
  );


  wrapper.appendChild(
    input
  );


  /* REMOVE */

  const removeButton =
    document.createElement('button');

  removeButton.type =
    'button';

  removeButton.className =
    'remove-image';

  removeButton.textContent =
    '×';

  removeButton.title =
    'Remove image';


  removeButton.addEventListener(
    'click',
    () => {

      wrapper.remove();

      hasUnsavedChanges =
        true;

    }
  );


  wrapper.appendChild(
    removeButton
  );


  imageFields.appendChild(
    wrapper
  );

}


/* =========================================================
   READ IMAGE FIELDS
========================================================= */

function getImagesFromForm(){

  return Array.from(
    imageFields.querySelectorAll(
      '.image-input'
    )
  )
    .map(
      input =>
        input.value.trim()
    )
    .filter(
      value =>
        value !== ''
    );

}


/* =========================================================
   SAVE PRODUCT LOCALLY
========================================================= */

productForm.addEventListener(
  'submit',
  event => {

    event.preventDefault();


    const name =
      productName.value.trim();


    if(!name){

      alert(
        'Please enter a product name.'
      );

      productName.focus();

      return;

    }


    const product = {

      name,

      status:
        productStatus.value,

      condition:
        productCondition.value.trim(),

      price:
        productPrice.value,

      description:
        productDescription.value.trim(),

      images:
        getImagesFromForm()

    };


    if(editingIndex === null){

      products.push(product);

    }else{

      products[editingIndex] =
        product;

    }


    renderProducts();

    updateStats();


    productEditor.hidden =
      true;


    editingIndex =
      null;


    hasUnsavedChanges =
      false;


    /*
      IMPORTANT:

      At this stage the changes only exist
      in this browser session.

      We will connect this to the secure
      Cloudflare Worker / GitHub API later.
    */

    alert(
      'Product updated in the admin preview. ' +
      'GitHub saving will be connected next.'
    );


  }
);


/* =========================================================
   DELETE PRODUCT
========================================================= */

function deleteProduct(index){

  const product =
    products[index];


  const confirmed =
    confirm(
      `Delete "${product.name}"?\n\n` +
      `This removes it from the current admin session.`
    );


  if(!confirmed){
    return;
  }


  products.splice(
    index,
    1
  );


  renderProducts();

  updateStats();

}


/* =========================================================
   ADD PRODUCT
========================================================= */

addProductButton.addEventListener(
  'click',
  () => {

    openEditor();

  }
);


/* =========================================================
   ADD IMAGE
========================================================= */

addImageButton.addEventListener(
  'click',
  () => {

    addImageField();

    hasUnsavedChanges =
      true;

  }
);


/* =========================================================
   CANCEL
========================================================= */

cancelProductButton.addEventListener(
  'click',
  closeEditor
);


closeEditorButton.addEventListener(
  'click',
  closeEditor
);


/* =========================================================
   TRACK FORM CHANGES
========================================================= */

productForm.addEventListener(
  'input',
  () => {

    hasUnsavedChanges =
      true;

  }
);


/* =========================================================
   WARN BEFORE LEAVING
========================================================= */

window.addEventListener(
  'beforeunload',
  event => {

    if(!hasUnsavedChanges){
      return;
    }


    event.preventDefault();

    event.returnValue =
      '';

  }
);


/* =========================================================
   START
========================================================= */

loadProducts();

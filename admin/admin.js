/* =========================================================
   SHIKADEAL ADMIN
   PRODUCTS / BLOG / GUIDES / 3D PRINTS MANAGEMENT
========================================================= */


/* =========================================================
   PRODUCTS MANAGEMENT
========================================================= */

let products = [];
let editingIndex = null;
let hasUnsavedChanges = false;

const WORKER_URL =
  'https://shikadeal-admin-api.ahmedtwahir.workers.dev/api/products';


/* =========================================================
   PRODUCT ELEMENTS
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

const productFeatured =
  document.getElementById('product-featured');

const addProductButton =
  document.getElementById('add-product-button');

const addImageButton =
  document.getElementById('add-image-button');

const cancelProductButton =
  document.getElementById('cancel-product');

const closeEditorButton =
  document.getElementById('close-editor');


/* =========================================================
   GENERAL HELPERS
========================================================= */

/*
  Format a number using Kenyan number formatting.
  Example:
  25000 -> "25,000"
*/

function formatNumber(value) {

  const number =
    Number(value);

  if (
    Number.isNaN(number)
  ) {

    return '0';
  }

  return number.toLocaleString('en-KE');
}


/*
  Escape HTML when HTML strings are ever required.

  Guides and Prints below no longer depend on this because
  they use textContent, but keeping this helper available
  makes the code safer if HTML strings are added later.
*/

function escapeHtml(value) {

  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


/* =========================================================
   IMAGE PATH
========================================================= */

function getImagePath(path) {

  if (!path) {
    return '';
  }

  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('../')
  ) {

    return path;
  }

  return '../' + path;
}


/* =========================================================
   PRICE FORMAT
========================================================= */

function formatPrice(price) {

  if (
    price === undefined ||
    price === null ||
    price === ''
  ) {

    return '';
  }

  const number =
    Number(price);

  if (
    Number.isNaN(number)
  ) {

    return String(price);
  }

  return (
    'KSh ' +
    number.toLocaleString('en-KE')
  );
}


/* =========================================================
   STATUS LABEL
========================================================= */

function getStatusLabel(status) {

  if (status === 'sold') {
    return 'SOLD';
  }

  if (status === 'reserved') {
    return 'RESERVED';
  }

  return 'AVAILABLE';
}


/* =========================================================
   PRODUCTS
   LOAD
========================================================= */

async function loadProducts() {

  try {

    const response =
      await fetch(
        `../data/products.json?v=${Date.now()}`,
        {
          cache: 'no-store'
        }
      );


    if (!response.ok) {

      throw new Error(
        'Could not load products.json'
      );
    }


    const data =
      await response.json();


    if (!Array.isArray(data)) {

      throw new Error(
        'products.json must contain an array'
      );
    }


    products =
      data.map(
        product => {

          let rawPrice =
            product.price;


          if (
            typeof rawPrice === 'string'
          ) {

            rawPrice =
              rawPrice
                .replace(
                  /KSh\s?|,/gi,
                  ''
                )
                .trim();
          }


          const parsedPrice =
            parseInt(
              rawPrice,
              10
            );


          return {

            name:
              product.name || '',

            status:
              product.status ||
              'available',

            condition:
              product.condition || '',

            price:
              Number.isNaN(parsedPrice)
                ? ''
                : parsedPrice,

            description:
              product.description || '',

            images:
              Array.isArray(
                product.images
              )
                ? [...product.images]
                : []
          };
        }
      );


    renderProducts();

    updateStats();


  } catch (error) {

    console.error(
      'Load products error:',
      error
    );


    if (productList) {

      productList.innerHTML = `
        <div class="loading-card">
          <strong>
            Unable to load products.
          </strong>

          <br><br>

          Check that
          <code>data/products.json</code>
          exists and contains valid JSON.
        </div>
      `;
    }
  }
}


/* =========================================================
   PRODUCTS
   RENDER
========================================================= */

function renderProducts() {

  if (!productList) {
    return;
  }


  productList.innerHTML = '';


  if (products.length === 0) {

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
    (product, index) => {

      const row =
        document.createElement('div');

      row.className =
        'product-row';


      /* =====================================================
         IMAGE
      ===================================================== */

      const firstImage =
        Array.isArray(product.images) &&
        product.images.length > 0
          ? product.images[0]
          : '';


      if (firstImage) {

        const image =
          document.createElement('img');

        image.className =
          'product-thumbnail';

        image.src =
          getImagePath(
            firstImage
          );

        image.alt =
          product.name ||
          'Product image';


        image.onerror =
          function () {

            image.replaceWith(
              createPlaceholder()
            );
          };


        row.appendChild(
          image
        );

      } else {

        row.appendChild(
          createPlaceholder()
        );
      }


      /* =====================================================
         NAME
      ===================================================== */

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


      name.appendChild(
        strong
      );

      name.appendChild(
        small
      );

      row.appendChild(
        name
      );


      /* =====================================================
         PRICE
      ===================================================== */

      const price =
        document.createElement('div');

      price.className =
        'product-row-price';

      price.textContent =
        formatPrice(
          product.price
        );

      row.appendChild(
        price
      );


      /* =====================================================
         STATUS
      ===================================================== */

      const status =
        document.createElement('span');

      status.className =
        `product-status status-${product.status}`;

      status.textContent =
        getStatusLabel(
          product.status
        );

      row.appendChild(
        status
      );


      /* =====================================================
         ACTIONS
      ===================================================== */

      const actions =
        document.createElement('div');

      actions.className =
        'product-row-actions';


      /* EDIT */

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
        function () {

          openEditor(
            index
          );
        }
      );


      /* DELETE */

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
        function () {

          deleteProduct(
            index
          );
        }
      );


      actions.appendChild(
        editButton
      );

      actions.appendChild(
        deleteButton
      );

      row.appendChild(
        actions
      );


      productList.appendChild(
        row
      );
    }
  );
}


/* =========================================================
   PRODUCT PLACEHOLDER
========================================================= */

function createPlaceholder() {

  const placeholder =
    document.createElement('div');

  placeholder.className =
    'product-thumbnail-placeholder';

  placeholder.textContent =
    'NO IMAGE';

  return placeholder;
}


/* =========================================================
   PRODUCT STATS
========================================================= */

function updateStats() {

  const productCount =
    document.getElementById(
      'product-count'
    );

  const availableCount =
    document.getElementById(
      'available-count'
    );

  const reservedCount =
    document.getElementById(
      'reserved-count'
    );

  const soldCount =
    document.getElementById(
      'sold-count'
    );


  if (productCount) {

    productCount.textContent =
      products.length;
  }


  if (availableCount) {

    availableCount.textContent =
      products.filter(
        product =>
          product.status ===
          'available'
      ).length;
  }


  if (reservedCount) {

    reservedCount.textContent =
      products.filter(
        product =>
          product.status ===
          'reserved'
      ).length;
  }


  if (soldCount) {

    soldCount.textContent =
      products.filter(
        product =>
          product.status ===
          'sold'
      ).length;
  }
}


/* =========================================================
   PRODUCT EDITOR
========================================================= */

function openEditor(index = null) {

  editingIndex =
    index;


  imageFields.innerHTML =
    '';


  hasUnsavedChanges =
    false;


  /* =======================================================
     ADD NEW PRODUCT
  ======================================================= */

  if (index === null) {

    editorTitle.textContent =
      'Add Product';

    productForm.reset();

    productStatus.value =
      'available';

    if (productFeatured) productFeatured.checked = false;

    addImageField('');

  }


  /* =======================================================
     EDIT EXISTING PRODUCT
  ======================================================= */

  else {

    const product =
      products[index];


    if (!product) {

      console.error(
        'Product not found:',
        index
      );

      alert(
        'Could not open this product.'
      );

      return;
    }


    editorTitle.textContent =
      'Edit Product';


    productName.value =
      product.name || '';

    productStatus.value =
      product.status ||
      'available';

    productCondition.value =
      product.condition || '';


    if (
      product.price === null ||
      product.price === undefined ||
      product.price === ''
    ) {

      productPrice.value =
        '';

    } else {

      productPrice.value =
        product.price;
    }


    productDescription.value =
      product.description || '';

    if (productFeatured) productFeatured.checked = !!product.featured;


    if (
      Array.isArray(
        product.images
      ) &&
      product.images.length > 0
    ) {

      product.images.forEach(
        image => {

          addImageField(
            image
          );
        }
      );

    } else {

      addImageField('');
    }
  }


  productEditor.hidden =
    false;


  productEditor.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}


/* =========================================================
   CLOSE PRODUCT EDITOR
========================================================= */

function closeEditor() {

  if (
    hasUnsavedChanges
  ) {

    const confirmed =
      confirm(
        'You have unsaved changes. Close anyway?'
      );

    if (!confirmed) {
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
   ADD PRODUCT IMAGE FIELD
========================================================= */

function addImageField(
  value = ''
) {

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


  if (value) {

    preview.src =
      getImagePath(
        value
      );
  }


  preview.onerror =
    function () {

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
    function () {

      hasUnsavedChanges =
        true;


      const path =
        input.value.trim();


      if (path) {

        preview.src =
          getImagePath(
            path
          );

      } else {

        preview.removeAttribute(
          'src'
        );
      }
    }
  );


  wrapper.appendChild(
    input
  );


  /* REMOVE BUTTON */

  const removeButton =
    document.createElement('button');

  removeButton.type =
    'button';

  removeButton.className =
    'remove-image';

  removeButton.textContent =
    '×';


  removeButton.addEventListener(
    'click',
    function () {

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


  return wrapper;
}


/* =========================================================
   GET PRODUCT IMAGES
========================================================= */

function getImagesFromForm() {

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
   SAVE PRODUCT
========================================================= */

if (productForm) {

  productForm.addEventListener(
    'submit',
    async function (event) {

      event.preventDefault();


      const name =
        productName.value.trim();


      if (!name) {

        alert(
          'Please enter a product name.'
        );

        productName.focus();

        return;
      }


      const cleanPrice =
        productPrice.value === ''
          ? ''
          : parseInt(
              productPrice.value,
              10
            );


      if (
        productPrice.value !== '' &&
        Number.isNaN(
          cleanPrice
        )
      ) {

        alert(
          'Please enter a valid price.'
        );

        productPrice.focus();

        return;
      }


      const product = {

        name:
          name,

        status:
          productStatus.value,

        condition:
          productCondition.value.trim(),

        price:
          cleanPrice,

        description:
          productDescription.value.trim(),

        featured:
          !!(productFeatured && productFeatured.checked),

        images:
          getImagesFromForm()
      };


      const updatedProducts =
        [...products];

      if (product.featured) {
        const featuredOthers = updatedProducts.filter((item, i) => item.featured && i !== editingIndex);
        if (featuredOthers.length >= 4) {
          alert('You already have 4 featured products. Unfeature one before selecting another.');
          return;
        }
      }

      if (
        editingIndex === null
      ) {

        updatedProducts.push(
          product
        );

      } else {

        if (
          !updatedProducts[
            editingIndex
          ]
        ) {

          alert(
            'The product could not be found. Please reload the page.'
          );

          return;
        }


        updatedProducts[
          editingIndex
        ] = product;
      }


      const adminKey =
        prompt(
          'Enter your admin key to save changes:'
        );


      if (!adminKey) {
        return;
      }


      try {

        const response =
          await fetch(
            WORKER_URL,
            {
              method:
                'POST',

              headers: {

                'Content-Type':
                  'application/json',

                'X-Admin-Key':
                  adminKey
              },

              body:
                JSON.stringify(
                  updatedProducts
                )
            }
          );


        const result =
          await response.json();


        if (!response.ok) {

          throw new Error(
            result.error ||
            'The Worker could not save data.'
          );
        }


        products =
          updatedProducts;


        renderProducts();

        updateStats();


        productEditor.hidden =
          true;

        editingIndex =
          null;

        hasUnsavedChanges =
          false;


        alert(
          'Product saved successfully to GitHub.'
        );


      } catch (error) {

        console.error(
          'Save error:',
          error
        );


        alert(
          'Could not save the product.\n\n' +
          error.message
        );
      }
    }
  );
}


/* =========================================================
   DELETE PRODUCT
========================================================= */

async function deleteProduct(
  index
) {

  const product =
    products[index];


  if (!product) {

    alert(
      'Could not find this product.'
    );

    return;
  }


  const confirmed =
    confirm(
      `Delete "${product.name}" permanently?`
    );


  if (!confirmed) {
    return;
  }


  const updatedProducts =
    [...products];


  updatedProducts.splice(
    index,
    1
  );


  const adminKey =
    prompt(
      'Enter your admin key to confirm deletion:'
    );


  if (!adminKey) {
    return;
  }


  try {

    const response =
      await fetch(
        WORKER_URL,
        {
          method:
            'POST',

          headers: {

            'Content-Type':
              'application/json',

            'X-Admin-Key':
              adminKey
          },

          body:
            JSON.stringify(
              updatedProducts
            )
        }
      );


    const result =
      await response.json();


    if (!response.ok) {

      throw new Error(
        result.error ||
        'The Worker could not execute the deletion.'
      );
    }


    products =
      updatedProducts;


    renderProducts();

    updateStats();


    if (
      editingIndex === index
    ) {

      productEditor.hidden =
        true;

      editingIndex =
        null;

      hasUnsavedChanges =
        false;

    } else if (
      editingIndex !== null &&
      index < editingIndex
    ) {

      editingIndex--;
    }


    alert(
      'Product deleted successfully from GitHub.'
    );


  } catch (error) {

    console.error(
      'Delete error:',
      error
    );


    alert(
      'Could not delete product.\n\n' +
      error.message
    );
  }
}


/* =========================================================
   PRODUCT BUTTON EVENTS
========================================================= */

if (addProductButton) {

  addProductButton.addEventListener(
    'click',
    function () {

      openEditor();

    }
  );
}


/* =========================================================
   PRODUCT IMAGE UPLOAD
========================================================= */

if (addImageButton) {

  addImageButton.addEventListener(
    'click',
    () => {

      const fileInput =
        document.createElement('input');

      fileInput.type =
        'file';

      fileInput.accept =
        'image/jpeg,image/png,image/webp';

      fileInput.style.display =
        'none';


      fileInput.addEventListener(
        'change',
        async () => {

          const file =
            fileInput.files[0];


          if (!file) {

            fileInput.remove();

            return;
          }


          if (
            file.size >
            10 * 1024 * 1024
          ) {

            alert(
              'Image is too large. Maximum size is 10 MB.'
            );

            fileInput.remove();

            return;
          }


          const adminKey =
            prompt(
              'Enter your admin key to upload this image:'
            );


          if (!adminKey) {

            fileInput.remove();

            return;
          }


          addImageButton.disabled =
            true;

          addImageButton.textContent =
            'Uploading...';


          try {

            const formData =
              new FormData();


            formData.append(
              'file',
              file
            );


            const response =
              await fetch(
                'https://shikadeal-admin-api.ahmedtwahir.workers.dev/api/upload-image',
                {
                  method: 'POST',

                  headers: {
                    'X-Admin-Key':
                      adminKey
                  },

                  body:
                    formData
                }
              );


            const result =
              await response.json();


            if (!response.ok) {

              throw new Error(
                result.error ||
                'Image upload failed.'
              );
            }


            const existingInputs =
              imageFields.querySelectorAll(
                '.image-input'
              );


            let imageField =
              null;


            for (
              const input of existingInputs
            ) {

              if (
                !input.value.trim()
              ) {

                imageField =
                  input.closest(
                    '.image-field'
                  );

                break;
              }
            }


            if (imageField) {

              const input =
                imageField.querySelector(
                  '.image-input'
                );

              const preview =
                imageField.querySelector(
                  '.image-preview'
                );


              input.value =
                result.path;


              preview.src =
                URL.createObjectURL(
                  file
                );

            } else {

              imageField =
                addImageField(
                  result.path
                );


              if (imageField) {

                const preview =
                  imageField.querySelector(
                    '.image-preview'
                  );


                if (preview) {

                  preview.src =
                    URL.createObjectURL(
                      file
                    );
                }
              }
            }


            hasUnsavedChanges =
              true;


            alert(
              'Image uploaded successfully.'
            );


          } catch (error) {

            console.error(
              'Image upload error:',
              error
            );


            alert(
              'Could not upload image.\n\n' +
              error.message
            );


          } finally {

            addImageButton.disabled =
              false;

            addImageButton.textContent =
              '+ Add Image';

            fileInput.remove();
          }
        }
      );


      document.body.appendChild(
        fileInput
      );


      fileInput.click();

    }
  );
}


/* =========================================================
   PRODUCT CLOSE BUTTONS
========================================================= */

if (cancelProductButton) {

  cancelProductButton.addEventListener(
    'click',
    closeEditor
  );
}


if (closeEditorButton) {

  closeEditorButton.addEventListener(
    'click',
    closeEditor
  );
}


/* =========================================================
   PRODUCT FORM CHANGE TRACKING
========================================================= */

if (productForm) {

  productForm.addEventListener(
    'input',
    function () {

      hasUnsavedChanges =
        true;
    }
  );
}


/* =========================================================
   BLOG MANAGEMENT
========================================================= */

let blogPosts = [];
let editingBlogIndex = null;


/* =========================================================
   BLOG ELEMENTS
========================================================= */

const blogList =
  document.getElementById('blog-list');

const blogEditor =
  document.getElementById('blog-editor');

const blogForm =
  document.getElementById('blog-form');

const blogEditorTitle =
  document.getElementById('blog-editor-title');

const addBlogButton =
  document.getElementById('add-blog-button');

const closeBlogEditorButton =
  document.getElementById('close-blog-editor');

const cancelBlogButton =
  document.getElementById('cancel-blog');


/* =========================================================
   BLOG API
========================================================= */

const BLOG_WORKER_URL =
  'https://shikadeal-admin-api.ahmedtwahir.workers.dev/api/blog';


/* =========================================================
   LOAD BLOG
========================================================= */

async function loadBlog() {

  if (!blogList) {
    return;
  }


  try {

    const response =
      await fetch(
        `../data/blog.json?v=${Date.now()}`,
        {
          cache: 'no-store'
        }
      );


    if (!response.ok) {

      throw new Error(
        'Could not load blog.json'
      );
    }


    const data =
      await response.json();


    if (!Array.isArray(data)) {

      throw new Error(
        'blog.json must contain an array'
      );
    }


    blogPosts =
      data.map(
        (post, index) => {

          if (post.id) {
            return post;
          }


          return {

            ...post,

            id:
              'blog-' +
              Date.now().toString(36) +
              '-' +
              index.toString(36)
          };
        }
      );


    renderBlog();


  } catch (error) {

    console.error(
      'Blog loading error:',
      error
    );


    blogList.innerHTML = `
      <div class="loading-card">

        <strong>
          Unable to load blog posts.
        </strong>

        <br><br>

        Check that
        <code>data/blog.json</code>
        exists and contains valid JSON.

      </div>
    `;
  }
}


/* =========================================================
   RENDER BLOG LIST
========================================================= */

function renderBlog() {

  if (!blogList) {
    return;
  }


  blogList.innerHTML = '';


  if (blogPosts.length === 0) {

    blogList.innerHTML = `
      <div class="loading-card">

        No blog posts yet.
        Click <strong>+ Add Post</strong>
        to create your first article.

      </div>
    `;

    return;
  }


  blogPosts.forEach(
    (post, index) => {

      const row =
        document.createElement('div');

      row.className =
        'product-row';
/* =====================================================
   COVER IMAGE
===================================================== */

if (post.coverImage) {

  const image =
    document.createElement('img');

  image.className =
    'product-thumbnail';

  image.src =
    getImagePath(
      post.coverImage
    );

  image.alt =
    post.title ||
    'Blog cover image';


  image.onerror =
    function () {

      image.replaceWith(
        createPlaceholder()
      );
    };


  row.appendChild(
    image
  );

} else {

  row.appendChild(
    createPlaceholder()
  );
}


      /* =====================================================
         TITLE
      ===================================================== */

      const name =
        document.createElement('div');

      name.className =
        'product-row-name';


      const strong =
        document.createElement('strong');

      strong.textContent =
        post.title ||
        'Untitled Post';


      const small =
        document.createElement('small');

      small.textContent =
        post.status
          ? post.status.toUpperCase()
          : 'DRAFT';


      name.appendChild(
        strong
      );

      name.appendChild(
        small
      );

      row.appendChild(
        name
      );


      /* DATE */

      const date =
        document.createElement('div');

      date.className =
        'product-row-price';


      if (post.date) {

        const parsedDate =
          new Date(
            post.date
          );


        if (!isNaN(parsedDate)) {

          date.textContent =
            parsedDate.toLocaleDateString(
              'en-KE',
              {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }
            );
        }
      }


      row.appendChild(
        date
      );


      /* STATUS */

      const status =
        document.createElement('span');

      status.className =
        `product-status status-${post.status || 'draft'}`;

      status.textContent =
        (
          post.status ||
          'draft'
        ).toUpperCase();


      row.appendChild(
        status
      );


      /* ACTIONS */

      const actions =
        document.createElement('div');

      actions.className =
        'product-row-actions';


      /* EDIT */

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
        function () {

          openBlogEditor(
            index
          );
        }
      );


      /* DELETE */

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
        function () {

          deleteBlogPost(
            index
          );
        }
      );


      actions.appendChild(
        editButton
      );

      actions.appendChild(
        deleteButton
      );

      row.appendChild(
        actions
      );


      blogList.appendChild(
        row
      );
    }
  );
}


/* =========================================================
   OPEN BLOG EDITOR
========================================================= */

function openBlogEditor(index = null) {

  editingBlogIndex =
    index;


  hasUnsavedChanges =
    false;


  const title =
    document.getElementById(
      'blog-title'
    );

  const slug =
    document.getElementById(
      'blog-slug'
    );

  const status =
    document.getElementById(
      'blog-status'
    );

  const date =
    document.getElementById(
      'blog-date'
    );

  const excerpt =
    document.getElementById(
      'blog-excerpt'
    );

  const content =
    document.getElementById(
      'blog-content'
    );

  const categories =
    document.getElementById(
      'blog-categories'
    );

  const tags =
    document.getElementById(
      'blog-tags'
    );

  const authorName =
    document.getElementById(
      'blog-author-name'
    );

  const authorProfile =
    document.getElementById(
      'blog-author-profile'
    );

  const metaTitle =
    document.getElementById(
      'blog-meta-title'
    );

  const metaDescription =
    document.getElementById(
      'blog-meta-description'
    );

  const ctaText =
    document.getElementById(
      'blog-cta-text'
    );

  const ctaLink =
    document.getElementById(
      'blog-cta-link'
    );

  const featured =
    document.getElementById(
      'blog-featured'
    );

  const coverField =
    document.getElementById(
      'blog-cover-field'
    );


  if (
    coverField
  ) {

    coverField.innerHTML =
      '';
  }


  /* NEW POST */

  if (index === null) {

    blogEditorTitle.textContent =
      'Add Post';

    blogForm.reset();

    status.value =
      'draft';

    date.value =
      '';

    if (ctaText) {
      ctaText.value = '';
    }

    if (ctaLink) {
      ctaLink.value = '';
    }
    if (featured) featured.checked = false;


    blogEditor.hidden =
      false;


    blogEditor.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });


    return;
  }


  /* EDIT */

  const post =
    blogPosts[index];


  if (!post) {

    alert(
      'Could not find this blog post.'
    );

    editingBlogIndex =
      null;

    return;
  }


  blogEditorTitle.textContent =
    'Edit Post';


  title.value =
    post.title || '';

  slug.value =
    post.slug || '';

  status.value =
    post.status || 'draft';

  if (featured) featured.checked = !!post.featured;


  /* DATE */

  if (post.date) {

    const parsedDate =
      new Date(
        post.date
      );


    if (!isNaN(parsedDate)) {

      const localDate =
        new Date(
          parsedDate.getTime() -
          parsedDate.getTimezoneOffset() *
            60000
        );


      date.value =
        localDate
          .toISOString()
          .slice(
            0,
            16
          );

    } else {

      date.value =
        '';
    }

  } else {

    date.value =
      '';
  }


  /* EXCERPT */

  excerpt.value =
    post.excerpt || '';


  /* CONTENT */

  content.value =
    post.content || '';


  /* CATEGORIES */

  categories.value =
    Array.isArray(
      post.categories
    )
      ? post.categories.join(', ')
      : '';


  /* TAGS */

  tags.value =
    Array.isArray(
      post.tags
    )
      ? post.tags.join(', ')
      : '';


  /* AUTHOR */

  if (
    post.author &&
    typeof post.author === 'object'
  ) {

    authorName.value =
      post.author.name || '';

    authorProfile.value =
      post.author.profile || '';

  } else {

    authorName.value =
      typeof post.author === 'string'
        ? post.author
        : '';

    authorProfile.value =
      '';
  }


  /* SEO */

  metaTitle.value =
    post.metaTitle || '';

  metaDescription.value =
    post.metaDescription || '';

  if (ctaText) {
    ctaText.value =
      post.ctaText || '';
  }

  if (ctaLink) {
    ctaLink.value =
      post.ctaLink || '';
  }


  /* COVER */

  if (
    post.coverImage &&
    coverField
  ) {

    createBlogCoverField(
      post.coverImage
    );
  }


  blogEditor.hidden =
    false;


  blogEditor.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}


/* =========================================================
   CREATE BLOG COVER FIELD
========================================================= */

function createBlogCoverField(
  value = ''
) {

  const coverField =
    document.getElementById(
      'blog-cover-field'
    );


  if (!coverField) {
    return null;
  }


  const wrapper =
    document.createElement('div');

  wrapper.className =
    'image-field';


  const preview =
    document.createElement('img');

  preview.className =
    'image-preview';

  preview.alt =
    'Cover image preview';


  if (value) {

    preview.src =
      getImagePath(
        value
      );
  }


  preview.onerror =
    function () {

      preview.removeAttribute(
        'src'
      );
    };


  wrapper.appendChild(
    preview
  );


  const input =
    document.createElement('input');

  input.type =
    'text';

  input.className =
    'image-input';

  input.placeholder =
    'images/blog/example.jpg';

  input.value =
    value;


  input.addEventListener(
    'input',
    function () {

      hasUnsavedChanges =
        true;


      const path =
        input.value.trim();


      if (path) {

        preview.src =
          getImagePath(
            path
          );

      } else {

        preview.removeAttribute(
          'src'
        );
      }
    }
  );


  wrapper.appendChild(
    input
  );


  const removeButton =
    document.createElement('button');

  removeButton.type =
    'button';

  removeButton.className =
    'remove-image';

  removeButton.textContent =
    '×';


  removeButton.addEventListener(
    'click',
    function () {

      wrapper.remove();

      hasUnsavedChanges =
        true;
    }
  );


  wrapper.appendChild(
    removeButton
  );


  coverField.appendChild(
    wrapper
  );


  return wrapper;
}


/* =========================================================
   GET BLOG COVER IMAGE
========================================================= */

function getBlogCoverImage() {

  const input =
    document.querySelector(
      '#blog-cover-field .image-input'
    );


  if (!input) {
    return '';
  }


  return input.value.trim();
}


/* =========================================================
   SAVE BLOG POST
========================================================= */

if (blogForm) {

  blogForm.addEventListener(
    'submit',
    async function (event) {

      event.preventDefault();


      const title =
        document.getElementById(
          'blog-title'
        ).value.trim();


      const slug =
        document.getElementById(
          'blog-slug'
        ).value.trim();


      const status =
        document.getElementById(
          'blog-status'
        ).value;


      const date =
        document.getElementById(
          'blog-date'
        ).value;


      const excerpt =
        document.getElementById(
          'blog-excerpt'
        ).value.trim();


      const content =
        document.getElementById(
          'blog-content'
        ).value.trim();


      const categories =
        document.getElementById(
          'blog-categories'
        ).value
          .split(',')
          .map(
            item =>
              item.trim()
          )
          .filter(
            item =>
              item !== ''
          );


      const tags =
        document.getElementById(
          'blog-tags'
        ).value
          .split(',')
          .map(
            item =>
              item.trim()
          )
          .filter(
            item =>
              item !== ''
          );


      const authorName =
        document.getElementById(
          'blog-author-name'
        ).value.trim();


      const authorProfile =
        document.getElementById(
          'blog-author-profile'
        ).value.trim();


      const metaTitle =
        document.getElementById(
          'blog-meta-title'
        ).value.trim();


      const metaDescription =
        document.getElementById(
          'blog-meta-description'
        ).value.trim();

      const ctaText =
        document.getElementById(
          'blog-cta-text'
        ).value.trim();

      const ctaLink =
        document.getElementById(
          'blog-cta-link'
        ).value.trim();

      const featured =
        !!document.getElementById('blog-featured')?.checked;

      const coverImage =
        getBlogCoverImage();


      /* VALIDATION */

      if (!title) {

        alert(
          'Please enter a blog title.'
        );

        document
          .getElementById('blog-title')
          .focus();

        return;
      }


      if (!slug) {

        alert(
          'Please enter a blog slug.'
        );

        document
          .getElementById('blog-slug')
          .focus();

        return;
      }


      /* BUILD POST */

      const post = {

        id:
          editingBlogIndex !== null
            ? blogPosts[
                editingBlogIndex
              ].id
            : 'blog-' +
              Date.now().toString(36) +
              '-' +
              Math.random()
                .toString(36)
                .substring(2, 8),

        title:
          title,

        slug:
          slug,

        status:
          status,

        date:
          date
            ? new Date(date).toISOString()
            : '',

        excerpt:
          excerpt,

        content:
          content,

        coverImage:
          coverImage,

        categories:
          categories,

        tags:
          tags,

        author: {

          name:
            authorName,

          profile:
            authorProfile
        },

        metaTitle:
          metaTitle,

        metaDescription:
          metaDescription,

        featured:
          featured,

        ctaText:
          ctaText,

        ctaLink:
          ctaLink
      };


      const updatedBlogPosts =
        [...blogPosts];

      if (featured) {
        const featuredOthers = updatedBlogPosts.filter((item, i) => item.featured && i !== editingBlogIndex);
        if (featuredOthers.length >= 4) {
          alert('You already have 4 featured blog posts. Unfeature one before selecting another.');
          return;
        }
      }

      /* ADD */

      if (
        editingBlogIndex === null
      ) {

        updatedBlogPosts.push(
          post
        );

      }


      /* EDIT */

      else {

        if (
          !updatedBlogPosts[
            editingBlogIndex
          ]
        ) {

          alert(
            'The blog post could not be found. Please reload the page.'
          );

          return;
        }


        updatedBlogPosts[
          editingBlogIndex
        ] = {

          ...updatedBlogPosts[
            editingBlogIndex
          ],

          ...post
        };
      }


      /* ADMIN KEY */

      const adminKey =
        prompt(
          'Enter your admin key to save changes:'
        );


      if (!adminKey) {
        return;
      }


      /* SAVE BUTTON */

      const saveButton =
        blogForm.querySelector(
          'button[type="submit"]'
        );


      if (saveButton) {

        saveButton.disabled =
          true;

        saveButton.textContent =
          'Saving...';
      }


      try {

        const response =
          await fetch(
            BLOG_WORKER_URL,
            {
              method:
                'POST',

              headers: {

                'Content-Type':
                  'application/json',

                'X-Admin-Key':
                  adminKey
              },

              body:
                JSON.stringify(
                  updatedBlogPosts
                )
            }
          );


        const result =
          await response.json();


        if (!response.ok) {

          throw new Error(
            result.error ||
            'The Worker could not save the blog posts.'
          );
        }


        blogPosts =
          updatedBlogPosts;


        renderBlog();


        blogEditor.hidden =
          true;


        editingBlogIndex =
          null;


        hasUnsavedChanges =
          false;


        alert(
          'Blog post saved successfully to GitHub.'
        );


      } catch (error) {

        console.error(
          'Blog save error:',
          error
        );


        alert(
          'Could not save the blog post.\n\n' +
          error.message
        );


      } finally {

        if (saveButton) {

          saveButton.disabled =
            false;

          saveButton.textContent =
            'Save Post';
        }
      }
    }
  );
}


/* =========================================================
   DELETE BLOG POST
========================================================= */

async function deleteBlogPost(
  index
) {

  const post =
    blogPosts[index];


  if (!post) {

    alert(
      'Could not find this blog post.'
    );

    return;
  }


  const confirmed =
    confirm(
      `Delete "${post.title || 'Untitled Post'}" permanently?`
    );


  if (!confirmed) {
    return;
  }


  const updatedBlogPosts =
    [...blogPosts];


  updatedBlogPosts.splice(
    index,
    1
  );


  const adminKey =
    prompt(
      'Enter your admin key to confirm deletion:'
    );


  if (!adminKey) {
    return;
  }


  try {

    const response =
      await fetch(
        BLOG_WORKER_URL,
        {
          method:
            'POST',

          headers: {

            'Content-Type':
              'application/json',

            'X-Admin-Key':
              adminKey
          },

          body:
            JSON.stringify(
              updatedBlogPosts
            )
        }
      );


    const result =
      await response.json();


    if (!response.ok) {

      throw new Error(
        result.error ||
        'The Worker could not delete the blog post.'
      );
    }


    blogPosts =
      updatedBlogPosts;


    renderBlog();


    alert(
      'Blog post deleted successfully from GitHub.'
    );


  } catch (error) {

    console.error(
      'Blog delete error:',
      error
    );


    alert(
      'Could not delete the blog post.\n\n' +
      error.message
    );
  }
}


/* =========================================================
   BLOG BUTTONS
========================================================= */

if (addBlogButton) {

  addBlogButton.addEventListener(
    'click',
    function () {

      openBlogEditor();

    }
  );
}


if (cancelBlogButton) {

  cancelBlogButton.addEventListener(
    'click',
    function () {

      if (
        hasUnsavedChanges
      ) {

        const confirmed =
          confirm(
            'You have unsaved changes. Close anyway?'
          );

        if (!confirmed) {
          return;
        }
      }


      blogEditor.hidden =
        true;

      editingBlogIndex =
        null;

      hasUnsavedChanges =
        false;
    }
  );
}


if (closeBlogEditorButton) {

  closeBlogEditorButton.addEventListener(
    'click',
    function () {

      if (
        hasUnsavedChanges
      ) {

        const confirmed =
          confirm(
            'You have unsaved changes. Close anyway?'
          );

        if (!confirmed) {
          return;
        }
      }


      blogEditor.hidden =
        true;

      editingBlogIndex =
        null;

      hasUnsavedChanges =
        false;
    }
  );
}


/* =========================================================
   BLOG COVER IMAGE UPLOAD
========================================================= */

const uploadBlogCoverButton =
  document.getElementById(
    'upload-blog-cover'
  );


if (uploadBlogCoverButton) {

  uploadBlogCoverButton.addEventListener(
    'click',
    function () {

      const fileInput =
        document.createElement('input');


      fileInput.type =
        'file';

      fileInput.accept =
        'image/jpeg,image/png,image/webp';

      fileInput.style.display =
        'none';


      fileInput.addEventListener(
        'change',
        async function () {

          const file =
            fileInput.files[0];


          if (!file) {

            fileInput.remove();

            return;
          }


          if (
            file.size >
            10 * 1024 * 1024
          ) {

            alert(
              'Image is too large. Maximum size is 10 MB.'
            );

            fileInput.remove();

            return;
          }


          const adminKey =
            prompt(
              'Enter your admin key to upload this image:'
            );


          if (!adminKey) {

            fileInput.remove();

            return;
          }


          uploadBlogCoverButton.disabled =
            true;

          uploadBlogCoverButton.textContent =
            'Uploading...';


          try {

            const formData =
              new FormData();


            formData.append(
              'file',
              file
            );


            const response =
              await fetch(
                'https://shikadeal-admin-api.ahmedtwahir.workers.dev/api/upload-blog-cover',
                {
                  method:
                    'POST',

                  headers: {

                    'X-Admin-Key':
                      adminKey
                  },

                  body:
                    formData
                }
              );


            const result =
              await response.json();


            if (!response.ok) {

              throw new Error(
                result.error ||
                'Image upload failed.'
              );
            }


            const coverField =
              document.getElementById(
                'blog-cover-field'
              );


            coverField.innerHTML =
              '';


            const wrapper =
              createBlogCoverField(
                result.path
              );


            const preview =
              wrapper.querySelector(
                '.image-preview'
              );


            if (preview) {

              preview.src =
                URL.createObjectURL(
                  file
                );
            }


            hasUnsavedChanges =
              true;


            alert(
              'Cover image uploaded successfully.'
            );


          } catch (error) {

            console.error(
              'Blog cover upload error:',
              error
            );


            alert(
              'Could not upload cover image.\n\n' +
              error.message
            );


          } finally {

            uploadBlogCoverButton.disabled =
              false;

            uploadBlogCoverButton.textContent =
              'Upload Cover Image';

            fileInput.remove();
          }
        }
      );


      document.body.appendChild(
        fileInput
      );


      fileInput.click();

    }
  );
}


/* =========================================================
   BLOG FORM CHANGE TRACKING
========================================================= */

if (blogForm) {

  blogForm.addEventListener(
    'input',
    function () {

      hasUnsavedChanges =
        true;
    }
  );


  blogForm.addEventListener(
    'change',
    function () {

      hasUnsavedChanges =
        true;
    }
  );
}


/* =========================================================
   GUIDES MANAGEMENT
========================================================= */

let guides = [];
let editingGuideIndex = null;


const GUIDE_WORKER_URL =
  'https://shikadeal-admin-api.ahmedtwahir.workers.dev/api/guides';


const guideList =
  document.getElementById(
    'guide-list'
  );

const guideEditor =
  document.getElementById(
    'guide-editor'
  );

const guideForm =
  document.getElementById(
    'guide-form'
  );

const guideEditorTitle =
  document.getElementById(
    'guide-editor-title'
  );


/* =========================================================
   LOAD GUIDES
========================================================= */

async function loadGuides() {

  if (!guideList) {
    return;
  }


  try {

    const response =
      await fetch(
        `../data/guides.json?v=${Date.now()}`,
        {
          cache: 'no-store'
        }
      );


    if (!response.ok) {

      throw new Error(
        'Could not load guides.json'
      );
    }


    const data =
      await response.json();


    if (!Array.isArray(data)) {

      throw new Error(
        'guides.json must contain an array'
      );
    }


    guides =
      data.map(
        (guide, index) => ({

          id:
            guide.id ||
            `guide-${index + 1}`,

          title:
            guide.title ||
            guide.name ||
            '',

          slug:
            guide.slug ||
            '',

          status:
            guide.status ||
            'draft',

          type:
            guide.type ||
            'PDF',

          price:
            Number(guide.price) ||
            0,

          badge:
            guide.badge ||
            '',

          description:
            guide.description ||
            '',

          url:
            guide.url ||
            guide.payhipUrl ||
            '',

          coverImage:
            guide.coverImage ||
            guide.image ||
            '',

          featured:
            Boolean(
              guide.featured
            ),

          updatedAt:
            guide.updatedAt ||
            ''
        })
      );


    renderGuides();


  } catch (error) {

    console.error(
      'Guide loading error:',
      error
    );


    guideList.innerHTML = '';


    const errorCard =
      document.createElement('div');

    errorCard.className =
      'error-card';


    const strong =
      document.createElement('strong');

    strong.textContent =
      'Unable to load guides.';


    const message =
      document.createElement('code');

    message.textContent =
      error.message;


    errorCard.appendChild(
      strong
    );


    errorCard.appendChild(
      document.createElement('br')
    );

    errorCard.appendChild(
      document.createElement('br')
    );


    errorCard.appendChild(
      message
    );


    guideList.appendChild(
      errorCard
    );
  }
}


/* =========================================================
   RENDER GUIDES
   USING DOM + textContent
========================================================= */

function renderGuides() {

  if (!guideList) {
    return;
  }


  guideList.innerHTML =
    '';


  if (!guides.length) {

    const emptyCard =
      document.createElement('div');

    emptyCard.className =
      'empty-card';

    emptyCard.textContent =
      'No guides yet. Click “Add Guide” to create the first one.';


    guideList.appendChild(
      emptyCard
    );

    return;
  }


  guides.forEach(
    (guide, index) => {

      const row =
        document.createElement('div');

      row.className =
        'product-row';


      /* =====================================================
         THUMBNAIL
      ===================================================== */

      if (guide.coverImage) {

        const image =
          document.createElement('img');

        image.className =
          'product-thumbnail';

        image.src =
          getImagePath(
            guide.coverImage
          );

        image.alt =
          guide.title ||
          'Guide cover';


        image.onerror =
          function () {

            image.replaceWith(
              createGuidePlaceholder()
            );
          };


        row.appendChild(
          image
        );

      } else {

        row.appendChild(
          createGuidePlaceholder()
        );
      }


      /* =====================================================
         NAME / DETAILS
      ===================================================== */

      const name =
        document.createElement('div');

      name.className =
        'product-row-name';


      const strong =
        document.createElement('strong');

      strong.textContent =
        guide.title ||
        'Untitled guide';


      const small =
        document.createElement('small');


      let details =
        guide.type ||
        'PDF';


      if (guide.badge) {

        details +=
          ' · ' +
          guide.badge;
      }


      if (guide.featured) {

        details +=
          ' · FEATURED';
      }


      small.textContent =
        details;


      name.appendChild(
        strong
      );

      name.appendChild(
        small
      );


      row.appendChild(
        name
      );


      /* =====================================================
         PRICE
      ===================================================== */

      const price =
        document.createElement('div');

      price.className =
        'product-row-price';


      if (guide.price) {

        price.textContent =
          'KSh ' +
          formatNumber(
            guide.price
          );

      } else {

        price.textContent =
          'FREE';
      }


      row.appendChild(
        price
      );


      /* =====================================================
         STATUS
      ===================================================== */

      const status =
        document.createElement('span');

      const guideStatus =
        guide.status ||
        'draft';


      status.className =
        'product-status status-' +
        guideStatus;


      status.textContent =
        guideStatus.replace(
          '-',
          ' '
        );


      row.appendChild(
        status
      );


      /* =====================================================
         ACTIONS
      ===================================================== */

      const actions =
        document.createElement('div');

      actions.className =
        'product-row-actions';


      /* EDIT */

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
        function () {

          openGuideEditor(
            index
          );
        }
      );


      /* DELETE */

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
        function () {

          deleteGuide(
            index
          );
        }
      );


      actions.appendChild(
        editButton
      );

      actions.appendChild(
        deleteButton
      );


      row.appendChild(
        actions
      );


      guideList.appendChild(
        row
      );
    }
  );
}


/* =========================================================
   GUIDE PLACEHOLDER
========================================================= */

function createGuidePlaceholder() {

  const placeholder =
    document.createElement('div');

  placeholder.className =
    'product-thumbnail-placeholder';

  placeholder.textContent =
    'NO COVER';


  return placeholder;
}


/* =========================================================
   OPEN GUIDE EDITOR
========================================================= */

function openGuideEditor(
  index = null
) {

  editingGuideIndex =
    index;


  hasUnsavedChanges =
    false;


  if (!guideForm) {
    return;
  }


  guideEditorTitle.textContent =
    index === null
      ? 'Add Guide'
      : 'Edit Guide';


  guideForm.reset();


  document.getElementById(
    'guide-status'
  ).value =
    'draft';


  document.getElementById(
    'guide-type'
  ).value =
    'PDF';


  document.getElementById(
    'guide-cover-field'
  ).innerHTML =
    '';


  /* =====================================================
     NEW GUIDE
  ===================================================== */

  if (index === null) {

    guideEditor.hidden =
      false;


    guideEditor.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });


    return;
  }


  /* =====================================================
     EDIT EXISTING GUIDE
  ===================================================== */

  const guide =
    guides[index];


  if (!guide) {

    alert(
      'Could not find this guide.'
    );

    editingGuideIndex =
      null;

    return;
  }


  document.getElementById(
    'guide-title'
  ).value =
    guide.title;


  document.getElementById(
    'guide-slug'
  ).value =
    guide.slug;


  document.getElementById(
    'guide-status'
  ).value =
    guide.status;


  document.getElementById(
    'guide-type'
  ).value =
    guide.type;


  document.getElementById(
    'guide-price'
  ).value =
    guide.price || '';


  document.getElementById(
    'guide-badge'
  ).value =
    guide.badge;


  document.getElementById(
    'guide-description'
  ).value =
    guide.description;


  document.getElementById(
    'guide-url'
  ).value =
    guide.url;

   document.getElementById(
    'guide-preview-url'
  ).value =
    guide.previewUrl;


  document.getElementById(
    'guide-featured'
  ).checked =
    guide.featured;


  if (guide.coverImage) {

    createGuideCoverField(
      guide.coverImage
    );
  }


  guideEditor.hidden =
    false;


  guideEditor.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}


/* =========================================================
   CREATE GUIDE COVER FIELD
========================================================= */

function createGuideCoverField(
  value = ''
) {

  const container =
    document.getElementById(
      'guide-cover-field'
    );


  if (!container) {
    return null;
  }


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
    'Guide cover preview';


  if (value) {

    preview.src =
      getImagePath(
        value
      );
  }


  preview.onerror =
    function () {

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
    'images/guides/example.jpg';

  input.value =
    value;


  input.addEventListener(
    'input',
    function () {

      hasUnsavedChanges =
        true;


      const path =
        input.value.trim();


      if (path) {

        preview.src =
          getImagePath(
            path
          );

      } else {

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

  const remove =
    document.createElement('button');

  remove.type =
    'button';

  remove.className =
    'remove-image';

  remove.textContent =
    '×';


  remove.addEventListener(
    'click',
    function () {

      wrapper.remove();

      hasUnsavedChanges =
        true;
    }
  );


  wrapper.appendChild(
    remove
  );


  container.appendChild(
    wrapper
  );


  return wrapper;
}


/* =========================================================
   GET GUIDE COVER IMAGE
========================================================= */

function getGuideCoverImage() {

  const input =
    document.querySelector(
      '#guide-cover-field .image-input'
    );


  if (!input) {
    return '';
  }


  return input.value.trim();
}


/* =========================================================
   SAVE GUIDES TO WORKER
========================================================= */

async function saveGuidesToWorker(
  updatedGuides
) {

  const adminKey =
    prompt(
      'Enter your admin key to save changes:'
    );


  if (!adminKey) {
    return false;
  }


  const response =
    await fetch(
      GUIDE_WORKER_URL,
      {
        method:
          'POST',

        headers: {

          'Content-Type':
            'application/json',

          'X-Admin-Key':
            adminKey
        },

        body:
          JSON.stringify(
            updatedGuides
          )
      }
    );


  const result =
    await response
      .json()
      .catch(
        () => ({})
      );


  if (
    !response.ok ||
    !result.success
  ) {

    throw new Error(
      result.error ||
      'The Worker could not save guides.'
    );
  }


  return true;
}


/* =========================================================
   DELETE GUIDE
========================================================= */

async function deleteGuide(
  index
) {

  const guide =
    guides[index];


  if (!guide) {
    return;
  }


  const confirmed =
    confirm(
      `Delete "${guide.title}"? This will remove it from guides.json.`
    );


  if (!confirmed) {
    return;
  }


  try {

    const updated =
      [...guides];


    updated.splice(
      index,
      1
    );


    if (
      await saveGuidesToWorker(
        updated
      )
    ) {

      guides =
        updated;


      renderGuides();


      alert(
        'Guide deleted successfully.'
      );
    }


  } catch (error) {

    console.error(
      'Guide delete error:',
      error
    );


    alert(
      'Could not delete the guide.\n\n' +
      error.message
    );
  }
}


/* =========================================================
   ADD GUIDE BUTTON
========================================================= */

const addGuideButton =
  document.getElementById(
    'add-guide-button'
  );


if (addGuideButton) {

  addGuideButton.addEventListener(
    'click',
    function () {

      openGuideEditor();

    }
  );
}


/* =========================================================
   CLOSE GUIDE EDITOR
========================================================= */

const closeGuideEditor =
  document.getElementById(
    'close-guide-editor'
  );

const cancelGuide =
  document.getElementById(
    'cancel-guide'
  );


function closeGuideEditorSafely() {

  if (
    hasUnsavedChanges
  ) {

    const confirmed =
      confirm(
        'You have unsaved changes. Close anyway?'
      );


    if (!confirmed) {
      return;
    }
  }


  guideEditor.hidden =
    true;

  editingGuideIndex =
    null;

  hasUnsavedChanges =
    false;
}


if (closeGuideEditor) {

  closeGuideEditor.addEventListener(
    'click',
    closeGuideEditorSafely
  );
}


if (cancelGuide) {

  cancelGuide.addEventListener(
    'click',
    closeGuideEditorSafely
  );
}


/* =========================================================
   SAVE GUIDE
========================================================= */

if (guideForm) {

  guideForm.addEventListener(
    'submit',
    async function (event) {

      event.preventDefault();


      const guide = {

        id:
          editingGuideIndex === null
            ? `guide-${Date.now()}`
            : guides[
                editingGuideIndex
              ].id,

        title:
          document.getElementById(
            'guide-title'
          ).value.trim(),

        slug:
          document.getElementById(
            'guide-slug'
          ).value.trim(),

        status:
          document.getElementById(
            'guide-status'
          ).value,

        type:
          document.getElementById(
            'guide-type'
          ).value.trim() ||
          'PDF',

        price:
          Number(
            document.getElementById(
              'guide-price'
            ).value
          ) || 0,

        badge:
          document.getElementById(
            'guide-badge'
          ).value.trim(),

        description:
          document.getElementById(
            'guide-description'
          ).value.trim(),

        url:
          document.getElementById(
            'guide-url'
          ).value.trim(),

         previewUrl:
          document.getElementById(
            'guide-preview-url'
          ).value.trim(),

        coverImage:
          getGuideCoverImage(),

        featured:
          document.getElementById(
            'guide-featured'
          ).checked,

        updatedAt:
          new Date().toISOString()
      };


      /* VALIDATION */

      if (
        !guide.title ||
        !guide.slug
      ) {

        alert(
          'Please enter a guide title and slug.'
        );

        return;
      }


      try {

        const updated =
          [...guides];

        if (guide.featured) {
          const featuredOthers = updated.filter((item, i) => item.featured && i !== editingGuideIndex);
          if (featuredOthers.length >= 4) {
            alert('You already have 4 featured guides. Unfeature one before selecting another.');
            return;
          }
        }

        if (
          editingGuideIndex === null
        ) {

          updated.push(
            guide
          );

        } else {

          if (
            !updated[
              editingGuideIndex
            ]
          ) {

            throw new Error(
              'The guide could not be found. Please reload the page.'
            );
          }


          updated[
            editingGuideIndex
          ] = guide;
        }


        const saved =
          await saveGuidesToWorker(
            updated
          );


        if (saved) {

          guides =
            updated;


          renderGuides();


          guideEditor.hidden =
            true;


          editingGuideIndex =
            null;


          hasUnsavedChanges =
            false;


          alert(
            'Guide saved successfully to GitHub.'
          );
        }


      } catch (error) {

        console.error(
          'Guide save error:',
          error
        );


        alert(
          'Could not save the guide.\n\n' +
          error.message
        );
      }
    }
  );
}


/* =========================================================
   GUIDE COVER UPLOAD
========================================================= */

const uploadGuideCoverButton =
  document.getElementById(
    'upload-guide-cover'
  );


if (uploadGuideCoverButton) {

  uploadGuideCoverButton.addEventListener(
    'click',
    function () {

      const fileInput =
        document.createElement('input');


      fileInput.type =
        'file';

      fileInput.accept =
        'image/jpeg,image/png,image/webp';


      fileInput.addEventListener(
        'change',
        async function () {

          const file =
            fileInput.files?.[0];


          if (!file) {
            return;
          }


          if (
            file.size >
            10 * 1024 * 1024
          ) {

            alert(
              'Image is too large. Maximum size is 10 MB.'
            );

            fileInput.remove();

            return;
          }


          const adminKey =
            prompt(
              'Enter your admin key to upload this image:'
            );


          if (!adminKey) {

            fileInput.remove();

            return;
          }


          const formData =
            new FormData();


          formData.append(
            'file',
            file
          );


          uploadGuideCoverButton.disabled =
            true;

          uploadGuideCoverButton.textContent =
            'Uploading...';


          try {

            const response =
              await fetch(
                'https://shikadeal-admin-api.ahmedtwahir.workers.dev/api/upload-guide-cover',
                {
                  method:
                    'POST',

                  headers: {

                    'X-Admin-Key':
                      adminKey
                  },

                  body:
                    formData
                }
              );


            const result =
              await response
                .json()
                .catch(
                  () => ({})
                );


            if (
              !response.ok ||
              !result.success
            ) {

              throw new Error(
                result.error ||
                'Image upload failed.'
              );
            }


            const coverField =
              document.getElementById(
                'guide-cover-field'
              );


            coverField.innerHTML =
              '';


            const wrapper =
              createGuideCoverField(
                result.path
              );


            const preview =
              wrapper.querySelector(
                '.image-preview'
              );


            if (preview) {

              preview.src =
                URL.createObjectURL(
                  file
                );
            }


            hasUnsavedChanges =
              true;


            alert(
              'Guide cover uploaded successfully.'
            );


          } catch (error) {

            console.error(
              'Guide cover upload error:',
              error
            );


            alert(
              'Could not upload guide cover.\n\n' +
              error.message
            );


          } finally {

            uploadGuideCoverButton.disabled =
              false;

            uploadGuideCoverButton.textContent =
              'Upload Cover Image';

            fileInput.remove();
          }
        }
      );


      document.body.appendChild(
        fileInput
      );


      fileInput.click();
    }
  );
}


/* =========================================================
   GUIDE FORM CHANGE TRACKING
========================================================= */

if (guideForm) {

  guideForm.addEventListener(
    'input',
    function () {

      hasUnsavedChanges =
        true;
    }
  );


  guideForm.addEventListener(
    'change',
    function () {

      hasUnsavedChanges =
        true;
    }
  );
}


/* =========================================================
   3D PRINTS MANAGEMENT
========================================================= */

let prints = [];
let editingPrintIndex = null;


const PRINT_WORKER_URL =
  'https://shikadeal-admin-api.ahmedtwahir.workers.dev/api/prints';


const printList =
  document.getElementById(
    'print-list'
  );

const printEditor =
  document.getElementById(
    'print-editor'
  );

const printForm =
  document.getElementById(
    'print-form'
  );

const printEditorTitle =
  document.getElementById(
    'print-editor-title'
  );


/* =========================================================
   LOAD PRINTS
========================================================= */

async function loadPrints() {

  if (!printList) {
    return;
  }


  try {

    const response =
      await fetch(
        `../data/prints.json?v=${Date.now()}`,
        {
          cache: 'no-store'
        }
      );


    if (!response.ok) {

      throw new Error(
        'Could not load prints.json'
      );
    }


    const data =
      await response.json();


    if (!Array.isArray(data)) {

      throw new Error(
        'prints.json must contain an array'
      );
    }


    prints =
      data.map(
        (p, index) => ({

          id:
            p.id ||
            `print-${index + 1}`,

          name:
            p.name ||
            p.title ||
            '',

          slug:
            p.slug ||
            '',

          status:
            p.status ||
            'available',

          category:
            p.category ||
            '',

          price:
            Number(p.price) ||
            0,

          material:
            p.material ||
            'PLA',

          description:
            p.description ||
            '',

          images:
            Array.isArray(
              p.images
            )
              ? p.images.filter(
                  Boolean
                )
              : [],

          featured:
            Boolean(
              p.featured
            ),

          updatedAt:
            p.updatedAt ||
            ''
        })
      );


    renderPrints();


  } catch (error) {

    console.error(
      'Print loading error:',
      error
    );


    printList.innerHTML =
      '';


    const errorCard =
      document.createElement('div');

    errorCard.className =
      'error-card';


    const strong =
      document.createElement('strong');

    strong.textContent =
      'Unable to load 3D prints.';


    const message =
      document.createElement('code');

    message.textContent =
      error.message;


    errorCard.appendChild(
      strong
    );


    errorCard.appendChild(
      document.createElement('br')
    );

    errorCard.appendChild(
      document.createElement('br')
    );


    errorCard.appendChild(
      message
    );


    printList.appendChild(
      errorCard
    );
  }
}


/* =========================================================
   RENDER PRINTS
   USING DOM + textContent
========================================================= */

function renderPrints() {

  if (!printList) {
    return;
  }


  printList.innerHTML =
    '';


  if (!prints.length) {

    const emptyCard =
      document.createElement('div');

    emptyCard.className =
      'empty-card';

    emptyCard.textContent =
      'No 3D prints yet. Click “Add 3D Print” to create the first one.';


    printList.appendChild(
      emptyCard
    );

    return;
  }


  prints.forEach(
    (print, index) => {

      const row =
        document.createElement('div');

      row.className =
        'product-row';


      /* =====================================================
         THUMBNAIL
      ===================================================== */

      const firstImage =
        print.images &&
        print.images.length > 0
          ? print.images[0]
          : '';


      if (firstImage) {

        const image =
          document.createElement('img');

        image.className =
          'product-thumbnail';

        image.src =
          getImagePath(
            firstImage
          );

        image.alt =
          print.name ||
          '3D print image';


        image.onerror =
          function () {

            image.replaceWith(
              createPrintPlaceholder()
            );
          };


        row.appendChild(
          image
        );

      } else {

        row.appendChild(
          createPrintPlaceholder()
        );
      }


      /* =====================================================
         NAME / DETAILS
      ===================================================== */

      const name =
        document.createElement('div');

      name.className =
        'product-row-name';


      const strong =
        document.createElement('strong');

      strong.textContent =
        print.name ||
        'Untitled print';


      const small =
        document.createElement('small');


      let details =
        print.category ||
        '3D Print';


      if (print.material) {

        details +=
          ' · ' +
          print.material;
      }


      if (print.featured) {

        details +=
          ' · FEATURED';
      }


      small.textContent =
        details;


      name.appendChild(
        strong
      );

      name.appendChild(
        small
      );


      row.appendChild(
        name
      );


      /* =====================================================
         PRICE
      ===================================================== */

      const price =
        document.createElement('div');

      price.className =
        'product-row-price';


      if (print.price) {

        price.textContent =
          'KSh ' +
          formatNumber(
            print.price
          );

      } else {

        price.textContent =
          'QUOTE';
      }


      row.appendChild(
        price
      );


      /* =====================================================
         STATUS
      ===================================================== */

      const status =
        document.createElement('span');

      const printStatus =
        print.status ||
        'available';


      status.className =
        'product-status status-' +
        printStatus;


      status.textContent =
        printStatus.replace(
          '-',
          ' '
        );


      row.appendChild(
        status
      );


      /* =====================================================
         ACTIONS
      ===================================================== */

      const actions =
        document.createElement('div');

      actions.className =
        'product-row-actions';


      /* EDIT */

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
        function () {

          openPrintEditor(
            index
          );
        }
      );


      /* DELETE */

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
        function () {

          deletePrint(
            index
          );
        }
      );


      actions.appendChild(
        editButton
      );

      actions.appendChild(
        deleteButton
      );


      row.appendChild(
        actions
      );


      printList.appendChild(
        row
      );
    }
  );
}


/* =========================================================
   PRINT PLACEHOLDER
========================================================= */

function createPrintPlaceholder() {

  const placeholder =
    document.createElement('div');

  placeholder.className =
    'product-thumbnail-placeholder';

  placeholder.textContent =
    'NO IMAGE';


  return placeholder;
}


/* =========================================================
   OPEN PRINT EDITOR
========================================================= */

function openPrintEditor(
  index = null
) {

  editingPrintIndex =
    index;


  hasUnsavedChanges =
    false;


  if (!printForm) {
    return;
  }


  printEditorTitle.textContent =
    index === null
      ? 'Add 3D Print'
      : 'Edit 3D Print';


  printForm.reset();


  document.getElementById(
    'print-status'
  ).value =
    'available';


  document.getElementById(
    'print-material'
  ).value =
    'PLA';


  document.getElementById(
    'print-image-fields'
  ).innerHTML =
    '';


  /* EDIT */

  if (index !== null) {

    const print =
      prints[index];


    if (!print) {
      return;
    }


    document.getElementById(
      'print-name'
    ).value =
      print.name;


    document.getElementById(
      'print-slug'
    ).value =
      print.slug;


    document.getElementById(
      'print-status'
    ).value =
      print.status;


    document.getElementById(
      'print-category'
    ).value =
      print.category;


    document.getElementById(
      'print-price'
    ).value =
      print.price || '';


    document.getElementById(
      'print-material'
    ).value =
      print.material;


    document.getElementById(
      'print-description'
    ).value =
      print.description;


    document.getElementById(
      'print-featured'
    ).checked =
      print.featured;


    print.images.forEach(
      image => {

        createPrintImageField(
          image
        );
      }
    );
  }


  printEditor.hidden =
    false;


  printEditor.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}


/* =========================================================
   CREATE PRINT IMAGE FIELD
========================================================= */

function createPrintImageField(
  value = ''
) {

  const container =
    document.getElementById(
      'print-image-fields'
    );


  if (!container) {
    return null;
  }


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
    'Print image preview';


  if (value) {

    preview.src =
      getImagePath(
        value
      );
  }


  preview.onerror =
    function () {

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
    'images/prints/example.jpg';

  input.value =
    value;


  input.addEventListener(
    'input',
    function () {

      hasUnsavedChanges =
        true;


      const path =
        input.value.trim();


      if (path) {

        preview.src =
          getImagePath(
            path
          );

      } else {

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

  const remove =
    document.createElement('button');

  remove.type =
    'button';

  remove.className =
    'remove-image';

  remove.textContent =
    '×';


  remove.addEventListener(
    'click',
    function () {

      wrapper.remove();

      hasUnsavedChanges =
        true;
    }
  );


  wrapper.appendChild(
    remove
  );


  container.appendChild(
    wrapper
  );


  return wrapper;
}


/* =========================================================
   GET PRINT IMAGES
========================================================= */

function getPrintImages() {

  return [
    ...document.querySelectorAll(
      '#print-image-fields .image-input'
    )
  ]
    .map(
      input =>
        input.value.trim()
    )
    .filter(
      Boolean
    );
}


/* =========================================================
   SAVE PRINTS TO WORKER
========================================================= */

async function savePrintsToWorker(
  updatedPrints
) {

  const adminKey =
    prompt(
      'Enter your admin key to save changes:'
    );


  if (!adminKey) {
    return false;
  }


  const response =
    await fetch(
      PRINT_WORKER_URL,
      {
        method:
          'POST',

        headers: {

          'Content-Type':
            'application/json',

          'X-Admin-Key':
            adminKey
        },

        body:
          JSON.stringify(
            updatedPrints
          )
      }
    );


  const result =
    await response
      .json()
      .catch(
        () => ({})
      );


  if (
    !response.ok ||
    !result.success
  ) {

    throw new Error(
      result.error ||
      'The Worker could not save 3D prints.'
    );
  }


  return true;
}


/* =========================================================
   DELETE PRINT
========================================================= */

async function deletePrint(
  index
) {

  const print =
    prints[index];


  if (!print) {
    return;
  }


  const confirmed =
    confirm(
      `Delete "${print.name}"? This will remove it from prints.json.`
    );


  if (!confirmed) {
    return;
  }


  try {

    const updated =
      [...prints];


    updated.splice(
      index,
      1
    );


    if (
      await savePrintsToWorker(
        updated
      )
    ) {

      prints =
        updated;


      renderPrints();


      alert(
        '3D print deleted successfully.'
      );
    }


  } catch (error) {

    console.error(
      'Print delete error:',
      error
    );


    alert(
      'Could not delete the 3D print.\n\n' +
      error.message
    );
  }
}


/* =========================================================
   PRINT BUTTONS
========================================================= */

const addPrintButton =
  document.getElementById(
    'add-print-button'
  );


const closePrintEditor =
  document.getElementById(
    'close-print-editor'
  );


const cancelPrint =
  document.getElementById(
    'cancel-print'
  );


if (addPrintButton) {

  addPrintButton.addEventListener(
    'click',
    function () {

      openPrintEditor();

    }
  );
}


function closePrintEditorSafely() {

  if (
    hasUnsavedChanges
  ) {

    const confirmed =
      confirm(
        'You have unsaved changes. Close anyway?'
      );


    if (!confirmed) {
      return;
    }
  }


  printEditor.hidden =
    true;

  editingPrintIndex =
    null;

  hasUnsavedChanges =
    false;
}


if (closePrintEditor) {

  closePrintEditor.addEventListener(
    'click',
    closePrintEditorSafely
  );
}


if (cancelPrint) {

  cancelPrint.addEventListener(
    'click',
    closePrintEditorSafely
  );
}


/* =========================================================
   ADD PRINT IMAGE BUTTON
========================================================= */

const addPrintImageButton =
  document.getElementById(
    'add-print-image-button'
  );


if (addPrintImageButton) {

  addPrintImageButton.addEventListener(
    'click',
    function () {

      createPrintImageField();

    }
  );
}


/* =========================================================
   SAVE PRINT
========================================================= */

if (printForm) {

  printForm.addEventListener(
    'submit',
    async function (event) {

      event.preventDefault();


      const print = {

        id:
          editingPrintIndex === null
            ? `print-${Date.now()}`
            : prints[
                editingPrintIndex
              ].id,

        name:
          document.getElementById(
            'print-name'
          ).value.trim(),

        slug:
          document.getElementById(
            'print-slug'
          ).value.trim(),

        status:
          document.getElementById(
            'print-status'
          ).value,

        category:
          document.getElementById(
            'print-category'
          ).value.trim(),

        price:
          Number(
            document.getElementById(
              'print-price'
            ).value
          ) || 0,

        material:
          document.getElementById(
            'print-material'
          ).value.trim() ||
          'PLA',

        description:
          document.getElementById(
            'print-description'
          ).value.trim(),

        images:
          getPrintImages(),

        featured:
          document.getElementById(
            'print-featured'
          ).checked,

        updatedAt:
          new Date().toISOString()
      };


      /* VALIDATION */

      if (
        !print.name ||
        !print.slug
      ) {

        alert(
          'Please enter a print name and slug.'
        );

        return;
      }


      try {

        const updated =
          [...prints];

        if (print.featured) {
          const featuredOthers = updated.filter((item, i) => item.featured && i !== editingPrintIndex);
          if (featuredOthers.length >= 4) {
            alert('You already have 4 featured prints. Unfeature one before selecting another.');
            return;
          }
        }

        if (
          editingPrintIndex === null
        ) {

          updated.push(
            print
          );

        } else {

          if (
            !updated[
              editingPrintIndex
            ]
          ) {

            throw new Error(
              'The 3D print could not be found. Please reload the page.'
            );
          }


          updated[
            editingPrintIndex
          ] = print;
        }


        const saved =
          await savePrintsToWorker(
            updated
          );


        if (saved) {

          prints =
            updated;


          renderPrints();


          printEditor.hidden =
            true;


          editingPrintIndex =
            null;


          hasUnsavedChanges =
            false;


          alert(
            '3D print saved successfully to GitHub.'
          );
        }


      } catch (error) {

        console.error(
          'Print save error:',
          error
        );


        alert(
          'Could not save the 3D print.\n\n' +
          error.message
        );
      }
    }
  );
}


/* =========================================================
   PRINT IMAGE UPLOAD
========================================================= */

let printUploadInput =
  document.getElementById(
    'print-upload-hidden'
  );


/*
  Create the hidden input if the HTML does not already
  contain one.
*/

if (
  addPrintImageButton &&
  !printUploadInput
) {

  printUploadInput =
    document.createElement('input');

  printUploadInput.type =
    'file';

  printUploadInput.id =
    'print-upload-hidden';

  printUploadInput.accept =
    'image/jpeg,image/png,image/webp';

  printUploadInput.hidden =
    true;


  document.body.appendChild(
    printUploadInput
  );
}


/*
  Create Upload Image button beside the existing
  Add Image button.
*/

let uploadPrintImageButton =
  document.getElementById(
    'upload-print-image'
  );


if (
  addPrintImageButton &&
  !uploadPrintImageButton
) {

  uploadPrintImageButton =
    document.createElement('button');

  uploadPrintImageButton.type =
    'button';

  uploadPrintImageButton.id =
    'upload-print-image';

  uploadPrintImageButton.className =
    'secondary-button';

  uploadPrintImageButton.textContent =
    'Upload Image';

  uploadPrintImageButton.style.marginLeft =
    '8px';


  addPrintImageButton.parentNode.appendChild(
    uploadPrintImageButton
  );
}


if (
  uploadPrintImageButton &&
  printUploadInput
) {

  uploadPrintImageButton.addEventListener(
    'click',
    function () {

      printUploadInput.click();

    }
  );


  printUploadInput.addEventListener(
    'change',
    async function () {

      const file =
        printUploadInput.files?.[0];


      if (!file) {
        return;
      }


      if (
        file.size >
        10 * 1024 * 1024
      ) {

        alert(
          'Image is too large. Maximum size is 10 MB.'
        );

        printUploadInput.value =
          '';

        return;
      }


      const adminKey =
        prompt(
          'Enter your admin key to upload this image:'
        );


      if (!adminKey) {

        printUploadInput.value =
          '';

        return;
      }


      const formData =
        new FormData();


      formData.append(
        'file',
        file
      );


      uploadPrintImageButton.disabled =
        true;

      uploadPrintImageButton.textContent =
        'Uploading...';


      try {

        const response =
          await fetch(
            'https://shikadeal-admin-api.ahmedtwahir.workers.dev/api/upload-print-image',
            {
              method:
                'POST',

              headers: {

                'X-Admin-Key':
                  adminKey
              },

              body:
                formData
            }
          );


        const result =
          await response
            .json()
            .catch(
              () => ({})
            );


        if (
          !response.ok ||
          !result.success
        ) {

          throw new Error(
            result.error ||
            'Image upload failed.'
          );
        }


        const wrapper =
          createPrintImageField(
            result.path
          );


        const preview =
          wrapper?.querySelector(
            '.image-preview'
          );


        if (preview) {

          preview.src =
            URL.createObjectURL(
              file
            );
        }


        hasUnsavedChanges =
          true;


        alert(
          'Print image uploaded successfully.'
        );


      } catch (error) {

        console.error(
          'Print image upload error:',
          error
        );


        alert(
          'Could not upload print image.\n\n' +
          error.message
        );


      } finally {

        uploadPrintImageButton.disabled =
          false;

        uploadPrintImageButton.textContent =
          'Upload Image';

        printUploadInput.value =
          '';
      }
    }
  );
}


/* =========================================================
   PRINT FORM CHANGE TRACKING
========================================================= */

if (printForm) {

  printForm.addEventListener(
    'input',
    function () {

      hasUnsavedChanges =
        true;
    }
  );


  printForm.addEventListener(
    'change',
    function () {

      hasUnsavedChanges =
        true;
    }
  );
}


/* =========================================================
   DEALS MANAGEMENT
========================================================= */

let deals = [];
let editingDealIndex = null;
const DEAL_WORKER_URL = 'https://shikadeal-admin-api.ahmedtwahir.workers.dev/api/deals';
const DEAL_IMAGE_WORKER_URL = 'https://shikadeal-admin-api.ahmedtwahir.workers.dev/api/upload-deal-image';
const dealList = document.getElementById('deal-list');
const dealEditor = document.getElementById('deal-editor');
const dealForm = document.getElementById('deal-form');
const dealEditorTitle = document.getElementById('deal-editor-title');
const addDealButton = document.getElementById('add-deal-button');
const closeDealEditor = document.getElementById('close-deal-editor');
const cancelDeal = document.getElementById('cancel-deal');
const uploadDealImage = document.getElementById('upload-deal-image');
const dealImageField = document.getElementById('deal-image-field');
let pendingDealImageFiles = [];

const dealField = id => document.getElementById(id);
const dealInputIds = ['deal-title','deal-slug','deal-status','deal-type','deal-category','deal-price','deal-currency','deal-shipping','deal-condition','deal-seller','deal-returns','deal-last-checked','deal-expires','deal-source-url','deal-assistance-url','deal-guide-url','deal-summary','deal-why','deal-checked','deal-catch','deal-take'];
const ebayUrlField = document.getElementById('deal-ebay-url');
const fetchEbayButton = document.getElementById('fetch-ebay-deal');
const ebayFetchStatus = document.getElementById('ebay-fetch-status');

function dealDateInput(value){
  if(!value) return '';
  const d=new Date(value); if(Number.isNaN(d.getTime())) return '';
  const pad=n=>String(n).padStart(2,'0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function dealDateValue(value){ return value ? new Date(value).toISOString() : ''; }
function dealEsc(value){return String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function dealMoney(v,c='KSh'){return v===null||v===undefined||v===''?'—':`${c} ${Number(v).toLocaleString()}`;}

async function loadDeals(){
  if(!dealList) return;
  try{
    const response=await fetch(`../data/deals.json?v=${Date.now()}`,{cache:'no-store'});
    if(!response.ok) throw new Error('Could not load deals.json');
    const data=await response.json(); if(!Array.isArray(data)) throw new Error('deals.json must contain an array');
    deals=data;
    renderDealsAdmin();
  }catch(error){ console.error(error); dealList.innerHTML=`<div class="error-card">Unable to load deals.<br>${dealEsc(error.message)}</div>`; }
}

function renderDealsAdmin(){

  if (!dealList) {
    return;
  }

  dealList.innerHTML = '';

  if (deals.length === 0) {
    dealList.innerHTML = `
      <div class="loading-card">
        No deals yet. Click <strong>+ Add Deal</strong>
        to publish your first find.
      </div>
    `;
    return;
  }

  deals.forEach(
    (deal, index) => {

      const row = document.createElement('div');
      row.className = 'product-row';

      /* =====================================================
         IMAGE — same structure/class as Products
      ===================================================== */

      if (deal.image) {
        const image = document.createElement('img');
        image.className = 'product-thumbnail';
        image.src = /^https?:\/\//i.test(String(deal.image || '')) ? deal.image : `../${dealEsc(deal.image)}`;
        image.alt = deal.title || 'Deal image';

        image.onerror = function () {
          image.replaceWith(createPlaceholder());
        };

        row.appendChild(image);
      } else {
        row.appendChild(createPlaceholder());
      }

      /* =====================================================
         NAME — same structure/class as Products
      ===================================================== */

      const name = document.createElement('div');
      name.className = 'product-row-name';

      const strong = document.createElement('strong');
      strong.textContent = deal.title || 'Untitled Deal';

      const small = document.createElement('small');
      const type = deal.type || 'international';
      const category = deal.category || 'Deal';
      small.textContent = `${type} · ${category}`;

      name.appendChild(strong);
      name.appendChild(small);
      row.appendChild(name);

      /* =====================================================
         PRICE — same structure/class as Products
      ===================================================== */

      const price = document.createElement('div');
      price.className = 'product-row-price';
      price.textContent = dealMoney(deal.price, deal.currency || 'KSh');
      row.appendChild(price);

      /* =====================================================
         STATUS — same structure/class as Products
      ===================================================== */

      const status = document.createElement('span');
      const dealStatus = deal.status || 'active';
      const statusClass =
        dealStatus === 'active'
          ? 'available'
          : dealStatus === 'ending-soon' || dealStatus === 'watch'
            ? 'reserved'
            : 'sold';

      status.className = `product-status status-${statusClass}`;

      const expired =
        dealStatus === 'expired' ||
        (deal.expiresAt && new Date(deal.expiresAt) < new Date());

      status.textContent = expired
        ? 'EXPIRED'
        : dealStatus.replace(/-/g, ' ').toUpperCase();

      row.appendChild(status);

      /* =====================================================
         ACTIONS — same structure/class as Products
      ===================================================== */

      const actions = document.createElement('div');
      actions.className = 'product-row-actions';

      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.className = 'small-button';
      editButton.textContent = 'Edit';
      editButton.addEventListener(
        'click',
        function () {
          openDealEditor(index);
        }
      );

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'small-button delete';
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener(
        'click',
        function () {
          deleteDeal(index);
        }
      );

      actions.appendChild(editButton);
      actions.appendChild(deleteButton);
      row.appendChild(actions);

      dealList.appendChild(row);
    }
  );
}

function setDealForm(d={}){
  const vals={
    'deal-title':d.title||'', 'deal-slug':d.slug||'', 'deal-status':d.status||'active', 'deal-type':d.type||'international', 'deal-category':d.category||'', 'deal-price':d.price??'', 'deal-currency':d.currency||'KSh', 'deal-shipping':d.shipping??'', 'deal-condition':d.condition||'', 'deal-seller':d.seller||'', 'deal-returns':d.returns||'', 'deal-last-checked':dealDateInput(d.lastChecked||new Date().toISOString()), 'deal-expires':dealDateInput(d.expiresAt||''), 'deal-source-url':d.sourceUrl||'', 'deal-assistance-url':d.assistanceUrl||'', 'deal-guide-url':d.guideUrl||'', 'deal-summary':d.summary||'', 'deal-why':d.whyNoticed||'', 'deal-checked':Array.isArray(d.checked)?d.checked.join(', '):(d.checked||''), 'deal-catch':d.theCatch||'', 'deal-take':d.ourTake||''
  };
  dealInputIds.forEach(id=>{const el=dealField(id); if(el) el.value=vals[id];});
  dealField('deal-featured').checked=!!d.featured;
  if (ebayUrlField) ebayUrlField.value=d.sourceUrl||'';
  if (ebayFetchStatus) ebayFetchStatus.textContent=d.ebay?.itemId ? `Fetched ${d.ebay.itemId}` : 'Never fetched';
  dealImageField.innerHTML='';
  if(d.image) createDealImageField(d.image); else createDealImageField('');
}
function createDealImageField(path){
  dealImageField.innerHTML='';
  const wrapper=document.createElement('div'); wrapper.className='image-field deal-image-field-row';
  if(path){
    const preview=document.createElement('img'); preview.className='image-preview'; preview.alt='Deal image preview';
    preview.src=/^https?:\/\//i.test(String(path))?path:`../${path}`;
    preview.onerror=()=>preview.replaceWith(createPlaceholder());
    wrapper.appendChild(preview);
  }
  const input=document.createElement('input'); input.type='text'; input.className='deal-image-input'; input.value=path||''; input.placeholder='images/deals/example.jpg';
  const remove=document.createElement('button'); remove.type='button'; remove.className='secondary-button remove-deal-image'; remove.textContent='Remove';
  remove.addEventListener('click',()=>{dealImageField.innerHTML='';createDealImageField('');});
  wrapper.appendChild(input); wrapper.appendChild(remove); dealImageField.appendChild(wrapper);
}
function openDealEditor(index=null){
  editingDealIndex=index; dealForm.dataset.ebayJson = index===null ? '' : (deals[index]?.ebay ? JSON.stringify(deals[index].ebay) : ''); dealEditorTitle.textContent=index===null?'Add Deal':'Edit Deal'; setDealForm(index===null?{}:deals[index]); dealEditor.hidden=false; dealEditor.scrollIntoView({behavior:'smooth',block:'start'}); hasUnsavedChanges=false;
}
function closeDeal(){dealEditor.hidden=true;editingDealIndex=null;hasUnsavedChanges=false;}
async function deleteDeal(index){
  const d=deals[index]; if(!d||!confirm(`Delete "${d.title}"? This will remove it from deals.json.`)) return;
  const next=deals.filter((_,i)=>i!==index); await saveDeals(next,'Delete deal');
}
async function uploadPendingDealImages(adminKey){
  if(!pendingDealImageFiles.length) return null;
  let uploadedPath=null;
  for(const file of pendingDealImageFiles){
    const fd=new FormData(); fd.append('file',file);
    const response=await fetch(DEAL_IMAGE_WORKER_URL,{method:'POST',headers:{'X-Admin-Key':adminKey},body:fd});
    const result=await response.json().catch(()=>({}));
    if(!response.ok||!result.success) throw new Error(result.error||'Deal image upload failed.');
    uploadedPath=result.path;
  }
  pendingDealImageFiles=[];
  return uploadedPath;
}

function normaliseDealFeatured(next){
  const now = new Date();
  return next.map(d => {
    const expired = d.status === 'expired' || d.status === 'sold-out' || d.status === 'reserved' || d.status === 'unavailable' || (d.expiresAt && new Date(d.expiresAt) < now) || (d.ebay && d.ebay.endDate && new Date(d.ebay.endDate) < now);
    return expired ? { ...d, featured: false } : d;
  });
}

async function saveDeals(next,message,providedKey=''){
  const adminKey=providedKey || prompt('Enter your Admin Key to save Deals:'); if(!adminKey) return false;
  const cleanedNext = normaliseDealFeatured(next);
  try{
    const response=await fetch(DEAL_WORKER_URL,{method:'POST',headers:{'Content-Type':'application/json','X-Admin-Key':adminKey},body:JSON.stringify(cleanedNext)});
    const result=await response.json().catch(()=>({})); if(!response.ok||!result.success) throw new Error(result.error||'Could not save deals.');
    deals=cleanedNext;renderDealsAdmin();closeDeal();alert('Deals saved successfully.');return true;
  }catch(error){console.error(error);alert('Could not save Deals.\n\n'+error.message);return false;}
}

if(addDealButton) addDealButton.addEventListener('click',()=>openDealEditor());
if(closeDealEditor) closeDealEditor.addEventListener('click',closeDeal);
if(cancelDeal) cancelDeal.addEventListener('click',closeDeal);
if(dealForm) dealForm.addEventListener('submit',async e=>{
  e.preventDefault();
  const title=dealField('deal-title').value.trim();
  const slug=dealField('deal-slug').value.trim();
  if(!title||!slug){alert('Title and slug are required.');return;}
  const existing=editingDealIndex===null?null:deals[editingDealIndex];
  const imageEl=dealImageField.querySelector('.deal-image-input');
  const adminKey=prompt('Enter your Admin Key to save this Deal and upload any selected images:');
  if(!adminKey) return;
  if(pendingDealImageFiles.length){
    try{ const uploadedPath=await uploadPendingDealImages(adminKey); if(uploadedPath && imageEl) imageEl.value=uploadedPath; }
    catch(error){ alert('Could not upload deal image.\n\n'+error.message); return; }
  }
  const checked=dealField('deal-checked').value.split(',').map(x=>x.trim()).filter(Boolean);
  const deal={...(existing||{}),id:existing?.id||`deal-${Date.now().toString(36)}`,title,slug,status:dealField('deal-status').value,type:dealField('deal-type').value,category:dealField('deal-category').value.trim(),price:dealField('deal-price').value===''?null:Number(dealField('deal-price').value),currency:dealField('deal-currency').value.trim()||'KSh',shipping:dealField('deal-shipping').value===''?null:Number(dealField('deal-shipping').value),condition:dealField('deal-condition').value.trim(),seller:dealField('deal-seller').value.trim(),returns:dealField('deal-returns').value.trim(),lastChecked:dealDateValue(dealField('deal-last-checked').value),expiresAt:dealDateValue(dealField('deal-expires').value),sourceUrl:dealField('deal-source-url').value.trim(),assistanceUrl:dealField('deal-assistance-url').value.trim(),guideUrl:dealField('deal-guide-url').value.trim(),summary:dealField('deal-summary').value.trim(),whyNoticed:dealField('deal-why').value.trim(),checked,theCatch:dealField('deal-catch').value.trim(),ourTake:dealField('deal-take').value.trim(),image:imageEl?.value.trim()||'',featured:dealField('deal-featured').checked,ebay:dealForm.dataset.ebayJson ? JSON.parse(dealForm.dataset.ebayJson) : (existing?.ebay || undefined),priceType:(dealForm.dataset.ebayJson ? JSON.parse(dealForm.dataset.ebayJson).priceType : (existing?.priceType || '')),updatedAt:new Date().toISOString()};
  if (deal.status === 'expired' || deal.status === 'sold-out' || deal.status === 'reserved' || deal.status === 'unavailable' || (deal.expiresAt && new Date(deal.expiresAt) < new Date()) || (deal.ebay && deal.ebay.endDate && new Date(deal.ebay.endDate) < new Date())) deal.featured = false;
  const next=[...deals];if(editingDealIndex===null)next.unshift(deal);else next[editingDealIndex]=deal;await saveDeals(next,'Save deal',adminKey);
});
if(dealForm){dealForm.addEventListener('input',()=>hasUnsavedChanges=true);dealForm.addEventListener('change',()=>hasUnsavedChanges=true);}
if(uploadDealImage){uploadDealImage.addEventListener('click',()=>{const input=document.createElement('input');input.type='file';input.accept='image/jpeg,image/png,image/webp';input.multiple=false;input.onchange=()=>{const files=Array.from(input.files||[]);if(!files.length)return;pendingDealImageFiles=files;const file=files[0];createDealImageField(file.name);const preview=dealImageField.querySelector('.image-preview');if(preview)preview.src=URL.createObjectURL(file);const status=document.createElement('small');status.className='field-help';status.textContent='Image queued. It will upload when you save the Deal.';dealImageField.appendChild(status);hasUnsavedChanges=true;};input.click();});}


/* =========================================================
   EBAY FETCH
========================================================= */

if (fetchEbayButton) {
  fetchEbayButton.addEventListener('click', async () => {
    const listingUrl = (ebayUrlField?.value || '').trim();
    if (!listingUrl) { alert('Paste an eBay listing URL first.'); return; }
    const adminKey = prompt('Enter your Admin Key to fetch the eBay listing:');
    if (!adminKey) return;
    try {
      fetchEbayButton.disabled = true;
      fetchEbayButton.textContent = 'FETCHING...';
      if (ebayFetchStatus) ebayFetchStatus.textContent = 'Contacting eBay…';
      const response = await fetch('https://shikadeal-admin-api.ahmedtwahir.workers.dev/api/ebay/fetch-item', {
        method:'POST', headers:{'Content-Type':'application/json','X-Admin-Key':adminKey}, body:JSON.stringify({url:listingUrl})
      });
      const result = await response.json().catch(()=>({}));
      if (!response.ok || !result.success) throw new Error(result.error || 'eBay fetch failed.');
      const item = result.item || {};
      const set = (id,val) => { const el=dealField(id); if(el && val!==undefined && val!==null) el.value=val; };
      set('deal-title', item.title || '');
      set('deal-slug', item.slug || '');
      set('deal-type', item.type || 'international');
      set('deal-category', item.category || '');
      set('deal-price', item.price ?? '');
      set('deal-currency', item.currency || 'USD');
      set('deal-shipping', item.shipping ?? '');
      set('deal-condition', item.condition || '');
      set('deal-seller', item.seller || '');
      set('deal-returns', item.returns || '');
      set('deal-last-checked', dealDateInput(item.lastChecked || new Date().toISOString()));
      set('deal-expires', dealDateInput(item.endDate || ''));
      set('deal-source-url', item.sourceUrl || listingUrl);
      if (item.image) createDealImageField(item.image);
      dealForm.dataset.ebayJson = JSON.stringify(item.ebay || {});
      if (ebayFetchStatus) ebayFetchStatus.textContent = `Fetched ${item.itemId || 'listing'} · ${item.buyingOptions || 'eBay'}`;
      hasUnsavedChanges = true;
    } catch(error) {
      console.error('eBay fetch error:', error);
      if (ebayFetchStatus) ebayFetchStatus.textContent = 'Fetch failed';
      alert('Could not fetch the eBay listing.\n\n' + error.message);
    } finally {
      fetchEbayButton.disabled = false;
      fetchEbayButton.textContent = 'FETCH FROM EBAY';
    }
  });
}

/* =========================================================
   UNSAVED CHANGES WARNING
========================================================= */

window.addEventListener(
  'beforeunload',
  function (event) {

    if (
      !hasUnsavedChanges
    ) {

      return;
    }


    event.preventDefault();

    event.returnValue =
      '';
  }
);


/* =========================================================
   INITIAL BOOTSTRAP
========================================================= */

loadDeals();

loadProducts();

loadBlog();

loadGuides();

loadPrints();

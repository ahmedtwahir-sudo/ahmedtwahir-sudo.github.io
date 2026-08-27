/* =========================================================
   SHIKADEAL ADMIN
   PRODUCTS MANAGEMENT
========================================================= */

let products = [];
let editingIndex = null;
let hasUnsavedChanges = false;

const WORKER_URL =
  'https://shikadeal-admin-api.ahmedtwahir.workers.dev/api/products';



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

async function loadProducts() {

  try {

    const response = await fetch(
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

    products = data.map(product => {

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
    });

    renderProducts();
    updateStats();

  } catch (error) {

    console.error(
      'Load products error:',
      error
    );

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


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts() {

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
        document.createElement(
          'div'
        );

      row.className =
        'product-row';


      /* -------------------------
         IMAGE
      ------------------------- */

      const firstImage =
        Array.isArray(
          product.images
        ) &&
        product.images.length > 0
          ? product.images[0]
          : '';

      if (firstImage) {

        const image =
          document.createElement(
            'img'
          );

        image.className =
          'product-thumbnail';

        image.src =
          getImagePath(
            firstImage
          );

        image.alt =
          product.name ||
          'Product image';

        image.onerror = () => {

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


      /* -------------------------
         NAME
      ------------------------- */

      const name =
        document.createElement(
          'div'
        );

      name.className =
        'product-row-name';


      const strong =
        document.createElement(
          'strong'
        );

      strong.textContent =
        product.name ||
        'Untitled Product';


      const small =
        document.createElement(
          'small'
        );

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


      /* -------------------------
         PRICE
      ------------------------- */

      const price =
        document.createElement(
          'div'
        );

      price.className =
        'product-row-price';

      price.textContent =
        formatPrice(
          product.price
        );

      row.appendChild(
        price
      );


      /* -------------------------
         STATUS
      ------------------------- */

      const status =
        document.createElement(
          'span'
        );

      status.className =
        `product-status status-${product.status}`;

      status.textContent =
        getStatusLabel(
          product.status
        );

      row.appendChild(
        status
      );


      /* -------------------------
         ACTIONS
      ------------------------- */

      const actions =
        document.createElement(
          'div'
        );

      actions.className =
        'product-row-actions';


      /* EDIT */

      const editButton =
        document.createElement(
          'button'
        );

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
        document.createElement(
          'button'
        );

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
   PLACEHOLDER
========================================================= */

function createPlaceholder() {

  const placeholder =
    document.createElement(
      'div'
    );

  placeholder.className =
    'product-thumbnail-placeholder';

  placeholder.textContent =
    'NO IMAGE';

  return placeholder;
}


/* =========================================================
   IMAGE PATH
========================================================= */

function getImagePath(path) {

  if (!path) {
    return '';
  }

  if (
    path.startsWith(
      'http://'
    ) ||
    path.startsWith(
      'https://'
    ) ||
    path.startsWith(
      '../'
    )
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

    return String(
      price
    );
  }

  return (
    'KSh ' +
    number.toLocaleString(
      'en-KE'
    )
  );
}


/* =========================================================
   STATUS LABEL
========================================================= */

function getStatusLabel(status) {

  if (
    status === 'sold'
  ) {

    return 'SOLD';
  }

  if (
    status === 'reserved'
  ) {

    return 'RESERVED';
  }

  return 'AVAILABLE';
}


/* =========================================================
   UPDATE STATS
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
   OPEN EDITOR
========================================================= */

function openEditor(index = null) {

  /*
    IMPORTANT:
    Store the index of the product being edited.
  */

  editingIndex =
    index;


  /*
    Remove old image fields.
  */

  imageFields.innerHTML =
    '';


  /*
    Opening an editor does not mean
    the user has changed anything yet.
  */

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


    /*
      Fill the form with the
      existing product data.
    */

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


    /*
      Restore all existing images.
    */

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


  /* =======================================================
     SHOW EDITOR
  ======================================================= */

  productEditor.hidden =
    false;


  productEditor.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}


/* =========================================================
   CLOSE EDITOR
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
   ADD IMAGE FIELD
========================================================= */

function addImageField(
  value = ''
) {

  const wrapper =
    document.createElement(
      'div'
    );

  wrapper.className =
    'image-field';


  /* -------------------------
     PREVIEW
  ------------------------- */

  const preview =
    document.createElement(
      'img'
    );

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


  /* -------------------------
     INPUT
  ------------------------- */

  const input =
    document.createElement(
      'input'
    );

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


  /* -------------------------
     REMOVE BUTTON
  ------------------------- */

  const removeButton =
    document.createElement(
      'button'
    );

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
   GET IMAGES
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

      images:
        getImagesFromForm()
    };


    /*
      Make a copy so we don't
      modify the current data
      until the Worker succeeds.
    */

    const updatedProducts =
      [...products];


    /* -------------------------
       ADD
    ------------------------- */

    if (
      editingIndex === null
    ) {

      updatedProducts.push(
        product
      );
    }


    /* -------------------------
       EDIT
    ------------------------- */

    else {

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


    /* -------------------------
       ADMIN KEY
    ------------------------- */

    const adminKey =
      prompt(
        'Enter your admin key to save changes:'
      );


    if (!adminKey) {
      return;
    }


    /* -------------------------
       SEND TO WORKER
    ------------------------- */

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


      /*
        Only update the local
        products after the Worker
        confirms success.
      */

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


    /*
      If the deleted product was
      the one currently being edited,
      close the editor.
    */

    if (
      editingIndex === index
    ) {

      productEditor.hidden =
        true;

      editingIndex =
        null;

      hasUnsavedChanges =
        false;
    }


    /*
      If a product before the
      currently edited product
      was deleted, adjust the index.
    */

    else if (
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
   BUTTON EVENTS
========================================================= */

addProductButton.addEventListener(
  'click',
  function () {

    openEditor();
  }
);


/* =========================================================
   IMAGE UPLOAD
========================================================= */

addImageButton.addEventListener(
  'click',
  () => {

    const fileInput =
      document.createElement('input');

    fileInput.type = 'file';

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


        /* ---------------------------------------------
           CHECK FILE SIZE
        --------------------------------------------- */

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


        /* ---------------------------------------------
           ASK FOR ADMIN KEY
        --------------------------------------------- */

        const adminKey =
          prompt(
            'Enter your admin key to upload this image:'
          );


        if (!adminKey) {

          fileInput.remove();
          return;
        }


        /* ---------------------------------------------
           SHOW UPLOAD STATUS
        --------------------------------------------- */

        addImageButton.disabled =
          true;

        addImageButton.textContent =
          'Uploading...';


        try {

          /* -------------------------------------------
             PREPARE FILE
          ------------------------------------------- */

          const formData =
            new FormData();

          formData.append(
            'file',
            file
          );


          /* -------------------------------------------
             UPLOAD TO WORKER
          ------------------------------------------- */

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


          /* -------------------------------------------
             ADD UPLOADED IMAGE TO FORM     
             FIND AN EXISTING EMPTY IMAGE FIELD
            --------------------------------------------- */
            
            const existingInputs =
              imageFields.querySelectorAll(
                '.image-input'
              );
            
            let imageField = null;
            
            for (const input of existingInputs) {
            
              if (!input.value.trim()) {
            
                imageField =
                  input.closest('.image-field');
            
                break;
              }
            }
            
            
            /* ---------------------------------------------
               USE EMPTY FIELD OR CREATE NEW ONE
            --------------------------------------------- */
            
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
                URL.createObjectURL(file);
            
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
                    URL.createObjectURL(file);
            
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



cancelProductButton.addEventListener(
  'click',
  closeEditor
);


closeEditorButton.addEventListener(
  'click',
  closeEditor
);


/* =========================================================
   FORM CHANGE TRACKING
========================================================= */

productForm.addEventListener(
  'input',
  function () {

    hasUnsavedChanges =
      true;
  }
);


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

loadProducts();

/* =========================================================
   BLOG MANAGEMENT
========================================================= */

let blogPosts = [];


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
   LOAD BLOG
========================================================= */

async function loadBlog() {

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
      data;


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


      /* -----------------------------------------------
         TITLE
      ----------------------------------------------- */

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


      /* -----------------------------------------------
         DATE
      ----------------------------------------------- */

      const date =
        document.createElement('div');


      date.className =
        'product-row-price';


      if (post.date) {

        const parsedDate =
          new Date(post.date);


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


      /* -----------------------------------------------
         STATUS
      ----------------------------------------------- */

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


      /* -----------------------------------------------
         ACTIONS
      ----------------------------------------------- */

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

          openBlogEditor(
            index
          );

        }
      );


      actions.appendChild(
        editButton
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

  blogEditor.hidden = false;

  blogEditor.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });


  /* =====================================================
     ELEMENTS
  ===================================================== */

  const title =
    document.getElementById('blog-title');

  const slug =
    document.getElementById('blog-slug');

  const status =
    document.getElementById('blog-status');

  const date =
    document.getElementById('blog-date');

  const excerpt =
    document.getElementById('blog-excerpt');

  const content =
    document.getElementById('blog-content');

  const categories =
    document.getElementById('blog-categories');

  const tags =
    document.getElementById('blog-tags');

  const authorName =
    document.getElementById('blog-author-name');

  const authorProfile =
    document.getElementById('blog-author-profile');

  const metaTitle =
    document.getElementById('blog-meta-title');

  const metaDescription =
    document.getElementById('blog-meta-description');


  /* =====================================================
     NEW POST
  ===================================================== */

  if (index === null) {

    blogEditorTitle.textContent =
      'Add Post';

    blogForm.reset();

    status.value =
      'draft';

    date.value =
      '';


    return;
  }


  /* =====================================================
     EDIT EXISTING POST
  ===================================================== */

  const post =
    blogPosts[index];


  if (!post) {

    alert(
      'Could not find this blog post.'
    );

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


  /* -----------------------------------------------------
     DATE
  ----------------------------------------------------- */

  if (post.date) {

    const parsedDate =
      new Date(post.date);


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


  /* -----------------------------------------------------
     EXCERPT
  ----------------------------------------------------- */

  excerpt.value =
    post.excerpt || '';


  /* -----------------------------------------------------
     CONTENT
  ----------------------------------------------------- */

  content.value =
    post.content || '';


  /* -----------------------------------------------------
     CATEGORIES
  ----------------------------------------------------- */

  categories.value =
    Array.isArray(
      post.categories
    )
      ? post.categories.join(', ')
      : '';


  /* -----------------------------------------------------
     TAGS
  ----------------------------------------------------- */

  tags.value =
    Array.isArray(
      post.tags
    )
      ? post.tags.join(', ')
      : '';


  /* -----------------------------------------------------
     AUTHOR
  ----------------------------------------------------- */

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


  /* -----------------------------------------------------
     SEO
  ----------------------------------------------------- */

  metaTitle.value =
    post.metaTitle || '';


  metaDescription.value =
    post.metaDescription || '';


  /* =====================================================
     COVER IMAGE
  ===================================================== */

  const coverField =
    document.getElementById(
      'blog-cover-field'
    );


  coverField.innerHTML = '';


  if (post.coverImage) {

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


    preview.src =
      getImagePath(
        post.coverImage
      );


    preview.onerror = () => {

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


    input.value =
      post.coverImage;


    input.placeholder =
      'images/blog/example.jpg';


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
      () => {

        wrapper.remove();

      }
    );


    wrapper.appendChild(
      removeButton
    );


    coverField.appendChild(
      wrapper
    );

  }

}



/* =========================================================
   ADD BLOG BUTTON
========================================================= */

if (addBlogButton) {

  addBlogButton.addEventListener(
    'click',
    () => {

      openBlogEditor();

    }
  );

}


/* =========================================================
   BLOG CLOSE BUTTONS
========================================================= */

if (cancelBlogButton) {

  cancelBlogButton.addEventListener(
    'click',
    () => {

      blogEditor.hidden =
        true;

    }
  );

}


if (closeBlogEditorButton) {

  closeBlogEditorButton.addEventListener(
    'click',
    () => {

      blogEditor.hidden =
        true;

    }
  );

}


/* =========================================================
   START BLOG
========================================================= */

loadBlog();


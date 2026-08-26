/* =========================================================
   SHIKADEAL ADMIN
========================================================= */


/* =========================================================
   LOAD PRODUCT STATISTICS
========================================================= */

async function loadProductStats(){

  const productCount =
    document.getElementById('product-count');

  const availableCount =
    document.getElementById('available-count');

  const reservedCount =
    document.getElementById('reserved-count');

  const soldCount =
    document.getElementById('sold-count');


  try{

    const response =
      await fetch('../data/products.json');


    if(!response.ok){

      throw new Error(
        'Could not load products.json'
      );

    }


    const products =
      await response.json();


    if(!Array.isArray(products)){

      throw new Error(
        'products.json must contain an array'
      );

    }


    const available =
      products.filter(
        product =>
          product.status === 'available'
      ).length;


    const reserved =
      products.filter(
        product =>
          product.status === 'reserved'
      ).length;


    const sold =
      products.filter(
        product =>
          product.status === 'sold'
      ).length;


    productCount.textContent =
      products.length;


    availableCount.textContent =
      available;


    reservedCount.textContent =
      reserved;


    soldCount.textContent =
      sold;


  }catch(error){

    console.error(
      'Admin product statistics error:',
      error
    );


    productCount.textContent =
      '—';

    availableCount.textContent =
      '—';

    reservedCount.textContent =
      '—';

    soldCount.textContent =
      '—';

  }

}


/* =========================================================
   START
========================================================= */

loadProductStats();


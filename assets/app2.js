// change language
document.addEventListener('click', function (event) {
  if (event.target.closest('.change-language')) {
    let code = event.target.closest('.change-language').dataset.code;
    let currentURL = window.location.pathname;

    document.getElementById('language').value = code;
    document.getElementById('redirect-to').value = currentURL;

    setTimeout(function () {
      document.getElementById('lang-shipping-country').submit();
    }, 500);
  }
});

// alert message
function alertMessage(message, type = 'error') {
  const alertContainer = document.createElement('div');
  alertContainer.id = 'alert-container';
  alertContainer.className =
    'fixed top-4 right-4	 w-3/4 max-w-md z-[2] animate-fadeIn';

  const icon =
    type === 'error'
      ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
       </svg>`
      : type === 'success'
      ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current " fill="none" viewBox="0 0 24 24">
         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
       </svg>`
      : `<svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    class="h-6 w-6 shrink-0 stroke-current">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>`;

  alertContainer.innerHTML = `
    <div role="alert" class="alert alert-${type} flex justify-center items-center gap-2 p-4 shadow-lg">
      ${icon}
      <span class="text-sm lg:text-lg  text-center">${message}</span>
    </div>
  `;

  document.body.appendChild(alertContainer);

  // Add fade-out animation before removing the alert
  setTimeout(() => {
    alertContainer.classList.replace('animate-fadeIn', 'animate-fadeOut');
    setTimeout(() => {
      alertContainer.remove();
    }, 500);
  }, 2500);
}

// wishlist

function addToWishlist(elm, productId, event) {
  event.stopPropagation();
  event.preventDefault();
  // Show loader and hide button
  const loader = elm.querySelector('.loader');
  const svg = elm.querySelector('svg');
  loader.classList.remove('hidden');
  svg.classList.add('hidden');

  // Check if item is already in the wishlist and remove it if so
  if (elm.classList.contains('filled')) {
    return removeFromWishlist(elm, productId);
  }

  zid.customer
    .addToWishlist(productId)
    .then((response) => {
      if (response.status === 'success') {
        elm.classList.add('filled');
        svg.classList.add('fill-red-700');
        alertMessage(response.data.message, 'success');
      } else {
        alertMessage(response.data.message, 'error');
      }
    })

    .catch((error) => {
      alertMessage(localsLayout.error, 'error');
    })
    .finally(() => {
      loader.classList.add('hidden');
      svg.classList.remove('hidden');
    });
}

function removeFromWishlist(elm, productId) {
  const loader = elm.querySelector('.loader');
  const svg = elm.querySelector('svg');
  loader.classList.remove('hidden');
  svg.classList.add('hidden');

  zid.customer
    .removeFromWishlist(productId)
    .then((response) => {
      if (response.status === 'success') {
        alertMessage(response.data.message, 'success');
        elm.classList.remove('filled');
        svg.classList.remove('fill-red-700');
        if (location.pathname === '/account-wishlist') {
          location.reload();
        }
      } else {
        alertMessage(response.data.message, 'error');
      }
    })
    .catch((error) => {
      alertMessage(localsLayout.error, 'error');
    })
    .finally(() => {
      loader.classList.add('hidden');
      svg.classList.remove('hidden');
    });
}

// add to cart
function addToCart(button, product_id, quantity) {
  const loadingIndicator = button.querySelector('.loading');

  if (loadingIndicator) {
    loadingIndicator.classList.remove('hidden');
  }
  button.disabled = true;

  zid.cart
    .addProduct({
      product_id: String(product_id),
      quantity: Number(quantity) || 1,
    }, { showErrorNotification: true })
    .then(function (response) {
      if (response) {
        alertMessage(localsLayout.success_add_cart, 'success');
        setCartBadge(response.cart_items_quantity ?? response.products_count);
      }
    })
    .catch(function (error) {
      alertMessage(localsLayout.error, 'error');
    })
    .finally(function () {
      if (loadingIndicator) {
        loadingIndicator.classList.add('hidden');
      }
      button.disabled = false;
    });
}

function showAddToCartModal(productId) {
  // Populate and show the modal
  const modal = document.getElementById('addToCart_popup');
  modal.querySelector('img').src = '';
  modal.querySelector('.modal-product-name').innerText = '';
  if (modal) {
    zid.products
      .list({ id: productId }, { showErrorNotification: true })
      .then((response) => {
        if (response && response.results && response.results.length > 0) {
          const product = response.results[0];
          const productImage = product?.images?.[0]?.image?.full_size;
          const productName = product?.name;
          modal.querySelector('img').src = productImage;
          modal.querySelector('.modal-product-name').innerText = productName;
          modal.showModal();
        }
      })
      .catch((error) => console.log(error));
  }
}

// set cart badge
function fetchCart() {
  zid.cart.get({ showErrorNotification: true }).then(function (cart) {
    if (cart && cart.id) {
      setCartBadge(cart.cart_items_quantity ?? cart.products_count);
    }
  });
}

function setCartBadge(badge) {
  const allBadgeCart = document.querySelectorAll('.badge_cart_icon');
  allBadgeCart.forEach((bdg) => {
    if (badge > 0) {
      bdg.classList.remove('hidden');
      bdg.textContent = badge;
    } else {
      bdg.classList.add('hidden');
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  fetchCart();
  observeLazyImages();
});

// popup show product

function handleShowProductPopup(productId) {
  // Fetch product details and populate modal

  const modal = document.getElementById('addToCart_popup_two');
  const modalContent = document.getElementById(
    'first_modal_popup_show_product'
  );
  const closeModalButton = document.getElementById('closeModalButton');
  const loadingPopupShowProduct = document.querySelector(
    '.first_loading_popup_show_product'
  );

  let swiper, swiper2;

  // Function to initialize Swiper
  const initializeSwipers = () => {
    swiper = new Swiper('.mySwiper', {
      spaceBetween: 10,
      slidesPerView: 4,
      freeMode: true,
      watchSlidesProgress: true,
    });

    swiper2 = new Swiper('.mySwiper2', {
      spaceBetween: 10,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      thumbs: {
        swiper: swiper,
      },
    });
  };
  // Show the modal and initialize Swipers
  modal.showModal();
  loadingPopupShowProduct.classList.remove('hidden');
  modalContent.classList.add('hidden');

  // Fetch the product details
  zid.products
    .get(productId)
    .then((response) => {
      const product = response?.product || (response?.results && response.results[0]) || response;
      if (product) {
        // Hide the spinner and show the content
        loadingPopupShowProduct.classList.add('hidden');
        modalContent.classList.remove('hidden');

        const rating = product?.rating?.average;
        let ratingHTML = '';

        if (rating) {
          const ratingRounded = Math.ceil(rating * 2) / 2;
          ratingHTML = '<div class="flex gap-2">';
          for (let n = 1; n <= 5; n++) {
            if (n <= ratingRounded) {
              // Full star
              ratingHTML += `
              <svg width="15" height="15" viewBox="0 0 68 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M34 0L41.858 24.1844L67.287 24.1844L46.7145 39.1312L54.5725 63.3156L34 48.3688L13.4275 63.3156L21.2855 39.1312L0.71302 24.1844L26.142 24.1844L34 0Z" fill="#f1c727"/>
              </svg>`;
            } else {
              // Empty star
              ratingHTML += `
              <svg width="15" height="15" viewBox="0 0 68 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M34 0L41.858 24.1844L67.287 24.1844L46.7145 39.1312L54.5725 63.3156L34 48.3688L13.4275 63.3156L21.2855 39.1312L0.71302 24.1844L26.142 24.1844L34 0Z" fill="#e3e3e3"/>
              </svg>`;
            }
          }
          ratingHTML += '</div>';
        } else {
          ratingHTML = `<div class="flex gap-2">
               <svg width="15" height="15" viewBox="0 0 68 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M34 0L41.858 24.1844L67.287 24.1844L46.7145 39.1312L54.5725 63.3156L34 48.3688L13.4275 63.3156L21.2855 39.1312L0.71302 24.1844L26.142 24.1844L34 0Z" fill="#e3e3e3"/>
              </svg>
               <svg width="15" height="15" viewBox="0 0 68 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M34 0L41.858 24.1844L67.287 24.1844L46.7145 39.1312L54.5725 63.3156L34 48.3688L13.4275 63.3156L21.2855 39.1312L0.71302 24.1844L26.142 24.1844L34 0Z" fill="#e3e3e3"/>
              </svg>
               <svg width="15" height="15" viewBox="0 0 68 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M34 0L41.858 24.1844L67.287 24.1844L46.7145 39.1312L54.5725 63.3156L34 48.3688L13.4275 63.3156L21.2855 39.1312L0.71302 24.1844L26.142 24.1844L34 0Z" fill="#e3e3e3"/>
              </svg>
               <svg width="15" height="15" viewBox="0 0 68 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M34 0L41.858 24.1844L67.287 24.1844L46.7145 39.1312L54.5725 63.3156L34 48.3688L13.4275 63.3156L21.2855 39.1312L0.71302 24.1844L26.142 24.1844L34 0Z" fill="#e3e3e3"/>
              </svg>
               <svg width="15" height="15" viewBox="0 0 68 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M34 0L41.858 24.1844L67.287 24.1844L46.7145 39.1312L54.5725 63.3156L34 48.3688L13.4275 63.3156L21.2855 39.1312L0.71302 24.1844L26.142 24.1844L34 0Z" fill="#e3e3e3"/>
              </svg>
          </div>`;
        }

        const galleryContainer = document.querySelector(
          '.mySwiper2 .swiper-wrapper'
        );
        const galleryContainerThumbs = document.querySelector(
          '.mySwiper .swiper-wrapper'
        );

        galleryContainer.innerHTML = '';
        galleryContainerThumbs.innerHTML = '';
        modal.querySelector('.content_popup_show_product').innerHTML = '';

        product?.images?.forEach((image, index) => {
          // Main gallery slide
          const mainSlide = document.createElement('div');
          mainSlide.classList.add('swiper-slide');
          mainSlide.innerHTML = `<img src="${image.image.full_size}" alt="${product.name}" class="block w-full h-full object-contain sm:object-cover">`;
          galleryContainer.appendChild(mainSlide);

          // Attach click event to open image preview modal
          mainSlide.addEventListener('click', () => {
            handleImageClick(index, product.images);
          });

          // Thumbnail gallery slide
          const thumbSlide = document.createElement('div');
          thumbSlide.classList.add('swiper-slide');
          thumbSlide.innerHTML = `<img src="${image.image.thumbnail}" alt="${product.name}" class="block w-full h-full object-contain sm:object-cover">`;
          galleryContainerThumbs.appendChild(thumbSlide);
        });
        console.log(product);
        const content = `<div class="flex flex-col gap-3 h-full">
                              <h2 class="card-title line-clamp-2 ">
                                ${product.name}
                              </h2>
                             ${
                               product?.short_description
                                 ? `<p class="line-clamp-3">${(() => {
                                     const tempDiv =
                                       document.createElement('div');
                                     tempDiv.innerHTML =
                                       product.short_description;
                                     return (
                                       tempDiv.textContent ||
                                       tempDiv.innerText ||
                                       ''
                                     );
                                   })()}</p>`
                                 : ''
                             }

                             ${ratingHTML}
                              ${
                                product.formatted_sale_price
                                  ? `<div class="flex items-center gap-3">
                                    <span class="line-through text-xs lg:text-sm text-neutral-content">${product.formatted_price}</span>
                                    <span class="text-red-700 font-bold text-sm lg:text-lg">${product.formatted_sale_price}</span>
                              </div>`
                                  : `<div class="text-primary font-bold text-sm lg:text-lg"><span>${product.formatted_price}</span></div>`
                              }
                              ${
                                product?.badge?.body?.ar
                                  ? `<div class="badge badge-outline text-xs sm:text-sm">${product?.badge?.body?.ar}</div>`
                                  : ''
                              }
                                ${
                                  product.is_infinite === false &&
                                  product.quantity <= 0
                                    ? `
                                 <button class="btn btn-primary mt-auto" disabled>
                                    ${localsLayout.product_out_of_stock}
                                 </button>`
                                    : product.has_options || product.has_fields
                                    ? `
                                 <a class="btn btn-primary mt-auto" adhref="/products/{{ product.slug }}">
                                    ${localsLayout.add_to_cart_2}
                                 </a>`
                                    : `
                                 <button class="btn btn-primary add-to-cart-btn relative mt-auto" type="button" data-product-id="${product.id}" onclick="addToCart(this,'${product.id}',1,event)">
                                    ${localsLayout.add_to_cart_2}
                                    <span class="loading loading-infinity loading-sm hidden absolute left-[15px] top-1/2 -translate-y-1/2"></span>
                                 </button>`
                                }
                         </div>`;
        modal.querySelector('.content_popup_show_product').innerHTML = content;

        initializeSwipers();
      } else {
        alertMessage(localsLayout.error, 'error');
        loadingPopupShowProduct.classList.add('hidden');
        modalContent.classList.remove('hidden');
      }
    })
    .catch((error) => {
      console.log('from catch');
      console.log(error);

      alertMessage(localsLayout.error, 'error');
      loadingPopupShowProduct.classList.add('hidden');
      modalContent.classList.remove('hidden');
    });

  // Close modal and destroy Swipers
  closeModalButton.addEventListener('click', () => {
    modal.close();
    if (swiper) swiper.destroy(true, true);
    if (swiper2) swiper2.destroy(true, true);
  });
}
document.querySelectorAll('.closeModalProduct').forEach((closeModalButton) => {
  closeModalButton.addEventListener('click', () => {
    closeModalButton.closest('dialog').close();
  });
});

// hanlde image preview
function handleImageClick(index, images) {
  const imagePreviewModal = document.getElementById('imagePreviewModal');
  const swiperWrapper = document.querySelector('.imageSwiper .swiper-wrapper');

  let imageSwiper;

  // Function to initialize the image swiper
  const initializeImageSwiper = () => {
    imageSwiper = new Swiper('.imageSwiper', {
      spaceBetween: 10,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      initialSlide: index,
    });
  };

  // Populate the swiper with images
  swiperWrapper.innerHTML = ''; // Clear existing slides
  images.forEach((image) => {
    const slide = document.createElement('div');
    slide.classList.add('swiper-slide');
    slide.innerHTML = `<img src="${image.image.full_size}" alt="Product Image" class="block w-full h-full object-contain">`;
    swiperWrapper.appendChild(slide);
  });

  // Open the modal
  imagePreviewModal.showModal();

  // Initialize Swiper
  initializeImageSwiper();

  const handleDocumentClick = (e) => {
    console.log(e.target);
    if (
      e.target.tagName !== 'IMG' &&
      !e.target.classList.contains('swiper-button-next') &&
      !e.target.classList.contains('swiper-button-prev')
    ) {
      imagePreviewModal.close();
      if (imageSwiper) imageSwiper.destroy(true, true);
      document.removeEventListener('click', handleDocumentClick);
    }
  };

  document.addEventListener('click', handleDocumentClick);
}

// copy link
const copyLink = (event) => {
  event.preventDefault();
  navigator.clipboard.writeText(window.location.href);
  const copyMessage = document.getElementById('copyMessage');
  copyMessage.classList.remove('hidden');
  setTimeout(() => {
    copyMessage.classList.add('hidden');
  }, 2000);
};

// cart
// global variables
let activeMiniCart = '';

// fetch products
async function fetchMiniCartProducts() {
  const loadingIndicatorCart = activeMiniCart.querySelector(
    '.mini_cart .loading_indicator'
  );

  const containerOfData = activeMiniCart.querySelector('.mini_cart .products');
  const noProductsSec = activeMiniCart.querySelector('.mini_cart .no-products');
  const infoBox = activeMiniCart.querySelector('.mini_cart .info_box');

  try {
    let cart = await zid.cart.get({ showErrorNotification: true });
    if (!cart || !cart.id) return false;
    if ((cart.cart_items_quantity ?? cart.products_count) == 0) {
      noProductsSec.classList.remove('hidden');
      noProductsSec.classList.add('flex');
      containerOfData.classList.add('hidden');
      infoBox.classList.add('hidden');
      return;
    }
    noProductsSec.classList.add('hidden');
    infoBox.classList.remove('hidden');
    containerOfData.innerHTML = '';
    containerOfData.classList.add('flex');
    containerOfData.classList.remove('hidden');
    createMiniCartProducts(cart.products);
    updateTotalMiniCart2(cart);
    return cart;
  } catch (error) {
    console.log(error);
    alertMessage(localsLayout.error, 'error');
  } finally {
    loadingIndicatorCart.classList.add('hidden');
  }
}

// create product
const createMiniCartProducts = (products) => {
  const containerOfData = activeMiniCart.querySelector('.mini_cart .products');

  let allProducts = '';
  products.forEach((product, index) => {
    allProducts += `
            <div class="flex flex-wrap items-center gap-2 mb-3 mini-cart-product justify-between ${
              index === products.length - 1
                ? ''
                : 'border-b-[1px] border-secondary pb-3'
            }" data-product="${product.id}" data-productId="${
      product.product_id
    }">
               <a href="${product.url}" class="block">
                              <figure class="h-20 w-20 overflow-hidden">
                                 <img
                                 src="${
                                   product?.images?.length
                                     ? product.images[0].thumbs.fullSize
                                     : '{{ "product-img.svg" | asset_url }}'
                                 }"

                                 alt="${product.name || 'Product image'}"
                                 class="w-full h-full object-cover"
                                 />
                              </figure>
                </a>
                <div class="flex flex-col gap-2 max-w-[128px]">
                  <div class="product_name font-bold line-clamp-4">
                      <a href="${product.url}">${product.name}</a>
                  </div>
                  ${
                    product?.net_sale_price
                      ? `<div class="flex items-center gap-3">
                          <span class="line-through text-xs text-neutral-content">${product.total_before_string}</span>
                          <span class="text-red-700 font-bold text-sm">${product.total_string}</span>
                        </div>`
                      : `<div class="text-primary font-bold text-sm"><span>${product.total_string}</span></div>`
                  }

                </div>
                <div class="flex items-center border border-base-300 rounded overflow-hidden">
                      <!-- Minus Button -->
                      <button
                          type="button"
                          class="w-5 h-5 flex items-center justify-center bg-base-200 hover:bg-base-300 focus:outline-none"
                          onclick="updateProductMiniCart(${product.id},${
      product.quantity - 1
    })"
                      >
                          <svg width="24" height="24" viewBox="0 0 51 50" class="stroke-current" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13 25H38"  stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                      </button>

                      <!-- Number Input -->
                      <input
                          type="number"
                          min="1"
                          max="${
                            product.is_infinite || product.quantity > 100
                              ? 100
                              : product.quantity
                          }"
                          value="${product.quantity}"
                          class="w-8 h-5 text-center appearance-none border-none focus:outline-none focus:ring-0 p-0 bg-base-100"
                          style="text-align: center; vertical-align: middle;"
                          id="qunatityInputProduct"
                          onchange="updateProductMiniCart(${
                            product.id
                          },this.value)"
                      />

                      <!-- Plus Button -->
                      <button
                          type="button"
                          class="w-5 h-5 flex items-center justify-center bg-base-200 hover:bg-base-300 focus:outline-none"
                          onclick="updateProductMiniCart(${product.id},${
      product.quantity + 1
    })"
                      >
                          <svg width="24" height="24" viewBox="0 0 51 50" class="stroke-current" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13 25H38"  stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M25.5 37.5V12.5"  stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                      </button>
                </div>
                <div class="product_delete">
                    <button class=""  onclick="deleteProductMiniCart(${
                      product.id
                    })">
                      <svg xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#d71d1d" d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
                    </button>
                </div>
            </div>
          `;
  });
  containerOfData.innerHTML = allProducts;
};

// update product quantity
function updateProductMiniCart(productId, qn) {
  if (qn == 0) {
    return;
  }

  const productItem = document.querySelector(
    `.mini-cart-product[data-product='${productId}']`
  );

  if (productItem) {
    productItem.style.transition = 'opacity 0.3s';
    productItem.style.opacity = '0.3';
  }

  zid.cart
    .updateProduct({
      product_id: productId,
      quantity: qn,
    }, { showErrorNotification: true })
    .then(function (response) {
      if (response) {
        fetchCart();
        fetchMiniCartProducts();
      } else {
        alertMessage(localsLayout.error, 'error');
      }
    })
    .finally(() => {
      if (productItem) {
        productItem.style.transition = 'opacity 600ms';
        productItem.style.opacity = 1;
      }
    });
}

// delete product
function deleteProductMiniCart(product_id) {
  // animation
  const productItem = activeMiniCart.querySelector(
    `.mini-cart-product[data-product='${product_id}']`
  );

  if (productItem) {
    productItem.style.transition = 'opacity 0.3s';
    productItem.style.opacity = '0.3';
  }

  zid.cart
    .removeProduct({ product_id: product_id }, { showErrorNotification: true })
    .then(function (response) {
      if (response) {
        fetchCart();
        fetchMiniCartProducts();
      } else {
        alertMessage(localsLayout.error, 'error');
      }
    })
    .finally(() => {
      if (productItem) {
        productItem.style.transition = 'opacity 600ms';
        productItem.style.opacity = 1;
      }
    });
}
function deleteProductInsidePage(product_id) {
  zid.cart
    .removeProduct({ product_id: product_id }, { showErrorNotification: true })
    .then(function (response) {
      if (!response) {
        alertMessage(localsLayout.error, 'error');
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

// update cart total price
function updateTotalMiniCart2(myCart) {
  const totalPrice = activeMiniCart.querySelector(
    '.mini_cart .info_box .total_price'
  );

  // update total price
  if (myCart.totals) {
    var cartTotalItem = myCart.totals.filter(function (total) {
      return total.code === 'total';
    });
    if (cartTotalItem.length > 0) {
      totalPrice.textContent = cartTotalItem[0].value_string;
    }
  } else if (myCart.total) {
    totalPrice.textContent = myCart.total.value_string;
  }

  // update free shipping
  if (myCart.fee_shipping_discount_rules) {
    const freeShippingSection = activeMiniCart.querySelector(
      '.mini_cart .free-shipping-rule-section'
    );
    const freeShippingProgress = activeMiniCart.querySelector(
      '.mini_cart .free-shipping-rule-progress'
    );
    const freeShippingMessage = activeMiniCart.querySelector(
      '.mini_cart .free-shipping-rule-message'
    );

    freeShippingSection.classList.remove('hidden');

    const percentage =
      myCart.fee_shipping_discount_rules.conditions_subtotal
        .products_subtotal_percentage_from_min >= 100
        ? '100'
        : myCart.fee_shipping_discount_rules.conditions_subtotal
            .products_subtotal_percentage_from_min;
    freeShippingProgress.style.width = `${percentage}%`;
    console.log(freeShippingMessage);
    if (
      myCart.fee_shipping_discount_rules.conditions_subtotal.status.code ===
      'applied'
    ) {
      freeShippingMessage.textContent = localsLayout.free_shipping;
    } else {
      freeShippingMessage.textContent = `${localsLayout.remaining} ${myCart.fee_shipping_discount_rules.conditions_subtotal.remaining} ${localsLayout.free_ship}`;
    }
  } else {
    const freeShippingSection = document.querySelector(
      '.mini_cart .free-shipping-rule-section'
    );
    if (freeShippingSection) {
      freeShippingSection.classList.add('hidden');
    }
  }
}

// send coupon
function sendCoupon() {
  const couponInput = activeMiniCart.querySelector('.send-coupon');
  const progressIndicator = activeMiniCart.querySelector(
    '.send-coupon-progress'
  );
  const pormoCodeSection = activeMiniCart.querySelector(
    '.mini_cart .info_box .message-promo'
  );

  if (!progressIndicator.classList.contains('hidden')) return;
  if (couponInput.value.length == 0) {
    alertMessage(localsLayout.empty_fields, 'error');
    return;
  }
  progressIndicator.classList.remove('hidden');

  zid.cart
    .applyCoupon({ coupon_code: couponInput.value }, { showErrorNotification: true })
    .then(function (response) {
      if (response) {
        alertMessage(localsLayout.delete_promo_success, 'success');
        pormoCodeSection.classList.remove('hidden');
        if (response.coupon && response.coupon.message) {
          const msg = response.coupon.message.split('-')[1] || response.coupon.message;
          alertMessage(msg, 'success');
          pormoCodeSection.querySelector('.message').textContent = msg;
        }
        updateTotalMiniCart2(response);
      }
    })
    .catch(function (err) {
      console.log(err);
      alertMessage(localsLayout.error, 'error');
    })
    .finally(function () {
      couponInput.value = '';
      progressIndicator.classList.add('hidden');
    });
}

// delete coupon
function showPopUpDeletePromo(element) {
  const r = element.closest('.message-promo');
  r.querySelector('.modal').showModal();
  console.log(element);
}
function deleteCoupon() {
  const progressIndicator = activeMiniCart.querySelector(
    '.mini_cart .delete-coupon-progress'
  );

  if (!progressIndicator.classList.contains('hidden')) return;

  progressIndicator.classList.remove('hidden');

  zid.cart
    .removeCoupons({ showErrorNotification: true })
    .then(function (response) {
      if (response) {
        alertMessage(localsLayout.delete_promo_success, 'success');
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        alertMessage(localsLayout.error, 'error');
      }
      progressIndicator.classList.add('hidden');
    })
    .catch(function (err) {
      progressIndicator.classList.add('hidden');
    });
}

// hide annocenemnt bar
function hideAnnouncementBar() {
  const announcementBar = document.querySelector('.announcement-bar');
  announcementBar.classList.add('hidden');
}

let imageObserver;

function observeLazyImages() {
  const lazyImages = document.querySelectorAll('img.lazy');

  // Initialize the observer if it doesn't exist
  if (!imageObserver) {
    imageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            if (img.dataset.srcset) img.srcset = img.dataset.srcset;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '200px 0px' }
    );
  }

  // Observe all current lazy images
  lazyImages.forEach((img) => imageObserver.observe(img));
}

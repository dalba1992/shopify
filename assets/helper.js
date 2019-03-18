function getFormData($form){
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};
    $.map(unindexed_array, function(n, i){
        indexed_array[n['name'].split('properties[').join('').split(']').join('')] = n['value'];
    });
    return indexed_array;
}
/*---------------------MODAL CHECKOUT-----------------------------*/
function showCheckoutModal()
{
    $.fancybox.open({ src: '#modalCheckOut',touch: false,afterShow: function () {
      	var preSavedEmail = sessionStorage.getItem('customer_email');
        if (preSavedEmail) {
            $('.modalchk-btns-wrap a').attr('href', '/checkout?checkout[email]=' + preSavedEmail);
        }
        currencyUpdate();
    }})
}
function modalCheckoutUpdate(){
    $price_format=price_format;
    if($('body').hasClass('checkout-popup')){
        $('.js-mdlchk-prd-count').text(CartJS.cart.item_count);
        $('.js-mdlchk-prd-total').html(Shopify.formatMoney(CartJS.cart.total_price, $price_format));
        renderPluralSingle('>1,0');
    }
}
function getLatestProductData(variant_id){
    setTimeout(function(){
        $price_format=price_format;
        $.each(CartJS.cart.items, function (i, item) {
            if(item.id == variant_id){
                $('.modalchk-price').html(Shopify.formatMoney(item.price, $price_format));
                $('.modalchk-prd-info .modalchk-title').html('<a href="' + item.url + '" title="' + item.product_title + '">' + item.product_title + '</a>');
                $('.modalchk-prd-info .label-options').html(item.variant_title);
                image = item.image;
                console.log(image);
                if(image.indexOf('.png?v=') !== -1)
                {
                    image = image.replace('.png?v=','_340x.png?v=');
                }
                else if(image.indexOf('.jpg?v=') !== -1)
                {
                    image = image.replace('.jpg?v=','_340x.jpg?v=');
                }
                else if(image.indexOf('.gif?v=') !== -1)
                {
                    image = image.replace('.gif?v=','_340x.gif?v=');
                }
                $('.modalchk-prd-image').html('<a href="' + item.url + '" title="' + item.title + '"><img src="' + image + '" alt="' + item.title + '"><div class="gdw-loader"></div></a>');
            }
        })
    },1000)

}
/*---------------------END MODAL CHECKOUT-----------------------------*/

function updateQueryStringParameter(uri, key, value) {
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    }
    else {
        return uri + separator + key + "=" + value;
    }
}

function updateData($type,$id,$options){

    path='product_options_'+$id;
    product_to_update=$('.product-info-block-id-'+$id);
    $price_format=price_format;

    $($type,$options).each(function(){
        if($type=='select') val=$(this).val(); else val=$(this).data('value');
        x='[\''+val+'\']';
        path+=x;
    });
  	
  console.log(path);
  
    if(eval(path)!=undefined){
        /*variant changer*/
        $('input[name=id]',product_to_update).val(eval(path+'[\'id\']'));
        window.history.pushState('', '', updateQueryStringParameter(window.location.toString(),'variant',eval(path+'[\'id\']')));

        /*add to cart button update for checkout modal*/
        $('.js-add-to-cart-product-page',product_to_update).attr('data-variant-id',eval(path+'[\'id\']'));

        /*price changer*/
        $('.prd-block_price--actual',product_to_update).html(Shopify.formatMoney(eval(path+'[\'price\']'), $price_format));
        /*price changer*/

        if(eval(path+'[\'compare_at_price\']')!='')
            $('.old-price',product_to_update).html(Shopify.formatMoney(eval(path+'[\'compare_at_price\']'), $price_format));
        else $('.old-price',product_to_update).html('');

        /*sku changer*/
        sku=eval(path+'[\'sku\']');
        if(sku == '')sku = '----'
        $('.product-sku span',product_to_update).html(sku);


        /*image changer*/
//         path_image=path+'[\'image\']';
//         var $image = $('.main-image.id_'+$id+' img');
//         var $previewsCarousel = $('#previewsGallery'+$id);
//         imgSrc = eval(path_image);
//         if ($previewsCarousel.length) {
//             var currentSelect = imgSrc.split('?').pop();
//             $previewsCarousel.find('.slick-slide').each(function () {
//                 if ($(this).attr('data-zoom-image').split('?').pop() == currentSelect) {
//                     $(this).trigger('click');
//                     return false;
//                 }
//             })
//         }
//         var newImg = document.createElement("img");
//         newImg.src = imgSrc;
//         newImg.onload = function () {
//             $image.attr('src', imgSrc);
//             $image.attr('data-zoom-image', imgSrc);
//         }

        /*stock changer*/
        path_inventory_management = eval(path + '[\'inventory_management\']');
        path_inventory_quantity = eval(path + '[\'inventory_quantity\']');
        path_inventory_policy = eval(path + '[\'inventory_policy\']');
        if (path_inventory_management == 'shopify' && path_inventory_policy == 'deny') {
            $('.stock-dynamic',product_to_update).removeClass('hidden').find('b').text(path_inventory_quantity);
            $('.qty-input',product_to_update).attr('data-max', path_inventory_quantity);
            if (parseInt($('.qty-input',product_to_update).val()) > parseInt(path_inventory_quantity)) {
                $('.qty-input',product_to_update).val(path_inventory_quantity);
            }
        } else {
            if (!$('.stock-dynamic',product_to_update).hasClass('hidden'))$('.stock-dynamic',product_to_update).addClass('hidden');
            $('.qty-input',product_to_update).removeAttr('data-max');
        }
    }
    currencyUpdate();
}

function add_to() {
    if($('body').hasClass('adding_'))return false;
    $('body').addClass('adding_');
    _this = $(this);
    $form=_this.closest('form');
    var line_properties = getFormData($('[name*=properties]',$form));
    CartJS.addItem(_this.data("variant-id"), 1, line_properties, {
        "success": function (data, textStatus, jqXHR) {
            if (_this.length) {
                if($('body').hasClass('checkout-popup'))
                {
                    getLatestProductData(_this.data("variant-id"));
                    setTimeout(function () {
                        showCheckoutModal();
                    }, 2000);
                }
                _this.addClass('btn--loading');
                setTimeout(function () {
                    $('.js-add-to-cart').removeClass('btn--loading');
                }, 2000);
                setTimeout(function () {
                    $('body').removeClass('adding_');
                }, 2500);
            }
        },
        "error": function (jqXHR, textStatus, errorThrown) {
            $('#modalError span').text('Some items became unavailable. Update the quantity and try again');
            $.fancybox.open({ src: '#modalError'})
            setTimeout(function () {
                $('body').removeClass('adding_');
            }, 2500);
        }
    });
    CartJS.clearAttributes();/*ie 11 fix ajax add to cart*/
}

if($('body').hasClass('ajax_cart'))
{
    $(document).on('click','.js-add-to-cart',function(e){
        add_to.call(this);
        e.preventDefault();
    });

    $(document).on('click','.js-add-to-cart-select',function(e){
        if($('body').hasClass('adding_'))return false;
        $('body').addClass('adding_');
        _this = $(this);
        $form=_this.closest('form');
        CartJS.addItem($('[name=id]',$form).val(), 1,{}, {
            "success": function(data, textStatus, jqXHR) {
                if($('body').hasClass('checkout-popup'))
                {
                    getLatestProductData($('[name=id]',$form).val());
                    setTimeout(function () {
                        showCheckoutModal();
                    }, 2000);
                }
                _this.addClass('btn--loading');
                setTimeout(function () {
                    $('.js-add-to-cart-select').removeClass('btn--loading');
                }, 2000);
                setTimeout(function () {
                    $('body').removeClass('adding_');
                }, 2500);
            },
            "error": function(jqXHR, textStatus, errorThrown) {
                $('#modalError span').text('Some items became unavailable. Update the quantity and try again');
                $.fancybox.open({ src: '#modalError'})
                setTimeout(function () {
                    $('body').removeClass('adding_');
                }, 2500);
            }
        });
        CartJS.clearAttributes();/*ie 11 fix ajax add to cart*/
        e.preventDefault();
    })

    $(document).on('click','.js-add-to-cart-product-page',function(e){
      e.preventDefault();
      
         if($('body').hasClass('loading'))return false;
         _this = $(this);
          $form=_this.closest('form');
          var line_properties = getFormData($('[name*=properties]',$form));
          CartJS.addItem($('[name=id]',$form).val(), $('[name=quantity]',$form).val(),line_properties, {
            "success": function(data, textStatus, jqXHR) {
                if($('.js-add-to-cart-product-page').length){
                  setTimeout(function () {
                  $('.minicart-link').click();
                    }, 2000);
//                     if($('body').hasClass('checkout-popup'))
//                     {
//                         getLatestProductData($('[name=id]',$form).val());
//                         setTimeout(function () {
//                             showCheckoutModal();
//                         }, 2000);
//                     }
//                     _this.addClass('btn--loading')
//                     setTimeout(function () {
//                         $('.js-add-to-cart-product-page').removeClass('btn--loading');
//                     }, 2000);
               }
            },
            "error": function(jqXHR, textStatus, errorThrown) {
                $('#modalError span').text('Some items became unavailable. Update the quantity and try again');
                $.fancybox.open({ src: '#modalError'})
             }        
                      });
        CartJS.clearAttributes();/*ie 11 fix ajax add to cart*/
        e.preventDefault();
    })
    
    $(document).on('click','.js-add-to-cart-product-page-checkout',function(e){
        if($('body').hasClass('loading'))return false;
        _this = $(this);
        $form=_this.closest('form');
        var line_properties = getFormData($('[name*=properties]',$form));
        CartJS.addItem($('[name=id]',$form).val(), $('[name=quantity]',$form).val(),line_properties, {
            "success": function(data, textStatus, jqXHR) {

                if($('.js-add-to-cart-product-page-checkout').length){                    
                    // _this.addClass('btn--loading');
                    // $('.js-add-to-cart-product-page').removeClass('btn--loading');
                    var url = 'https://www.ilovepaws.com/checkout';
                    var preSavedEmail = sessionStorage.getItem('customer_email');
                    if (preSavedEmail) {
                      url += '?checkout[email]=' + preSavedEmail;
                    }
                    window.location.replace(url);
                }
            },
            "error": function(jqXHR, textStatus, errorThrown) {
                $('#modalError span').text('Some items became unavailable. Update the quantity and try again');
                $.fancybox.open({ src: '#modalError'})
            }
        });
        CartJS.clearAttributes();/*ie 11 fix ajax add to cart*/
        e.preventDefault();
    })


}

function cartPopupUpdate(){
    $cart_count=$('.minicart .minicart-qty');
    cart_list='.minicart-drop-content';
    $cart_subtotal=$('.minicart-total');
    $price_format=price_format;
    if(CartJS.cart.item_count > 0)
    {
      $('.minicart-drop .holder .minicart-drop-total').show();
      $('.minicart-drop .holder .minicart-drop-content').show();
      $('.minicart-drop .holder .cart-empty').hide();
      
//         $('.minicart-drop .holder').html('<div class="container py-3 minicart-drop-close"><div class="row"><div class="col h3 mb-0">Ajax Cart</div><div class="col-auto ml-auto pr-4 h4 mb-0"><svg class="icon-cross"><use xlink:href="#icon-cross"></use></svg></div></div></div><div class="container pb-3 minicart-drop-content"></div>' +
//             '<div class="minicart-drop-total py-3"></div>');
    
        $updated_list='';
        line_item=1;
      
      	var totalPriceBold = 0;
        $.each(CartJS.cart.items, function(index, item) {
          //debugger;
            variant_title='';
            properties='';
            $.each(item.properties, function(a, b) {
                if(b!="")
                {
                    properties=properties+'<div class=\'options_title\'>'+a+': '+b+'</div>';
                }
            });
          
          var finalPrice = item.price;
          if (item.properties.hasOwnProperty('_boldVariantPrices')) {
            var boldPrices = item.properties._boldVariantPrices.split(',');
            $.each(boldPrices, function(index, price) {
              finalPrice = finalPrice + Number(price);
            });
          }
          totalPriceBold = totalPriceBold + finalPrice;
          	
          
            if(item.variant_title != 'Default' && item.variant_title != undefined){variant_title=item.variant_title}
            $item='<div class="row py-3 cart-list-prd"><div class="col-3 col-lg-1"> <a href="' + item.url+'" title="'+item.product_title+'"><img src = "'+item.image+'" width="100%" alt="'+item.product_title+'"></a></div><div class="col-7 col-lg-10 px-0"><div class="row"><div class="col-12 col-lg-6 minicart-prd-name"><div class="font-weight-bold text-truncate"><a href="' +item.url+'">'+item.product_title+'</a></div><div><a href="' +item.url+'">'+variant_title+'</a></div>' +
            '<a href="#" class="options-dropdown" tabindex="0" data-toggle="popover" data-trigger="focus" data-html="true" data-boundary="viewport" data-placement="bottom" data-content="' + properties + '">Options <svg class="icon-angle-down" style="font-size:14px;"><use xlink:href="#icon-angle-down"></use></svg></a>' +
            '</div><div class="col-6 col-lg-2">'+locales.qty+': '+item.quantity+'</div>' + 
              '<div class="col-6 col-lg-2">'+Shopify.formatMoney(finalPrice, $price_format)+'</div></div></div><div class="col-2 col-lg-1 pt-3 text-center minicart-prd-action"><a href="' + item.url+'" data-variant-id="'+item.variant_id+'" data-line-number="'+line_item+'"  title="'+locales.remove+'" class="js-minicart-remove-item"><svg class="icon-trash"><use xlink:href="#icon-trash"></use></svg></a></div></div>';
            $updated_list=$updated_list+$item;
            line_item=line_item+1;
            $(cart_list).html('<div class="block fullheight fullwidth empty-cart"> <div class="container"> <div class="image-empty-cart"> <img src="//cdn.shopify.com/s/files/1/0744/9541/t/139/assets/empty-basket.png?17187805938738385478" alt=""> <div class="text-empty-cart-1">SHOPPING CART IS</div> <div class="text-empty-cart-2">EMPTY</div> </div> <div><a href="#" onclick="history.go(-1);return false;" class="btn">back to previous page</a></div> </div> </div>'); 
        }); 
      
        $('.minicart-drop .holder .minicart-drop-total').html('<div class="container"><div class="row"><div class="col-12 col-lg-5 order-lg-3"><div class="row"><div class="col-auto mr-auto mb-2">Subtotal ('+(CartJS.cart.item_count)+(CartJS.cart.item_count === 1 ? ' Item' : ' Items') + '):</div><div class="col-auto mb-2"><b>'+Shopify.formatMoney(totalPriceBold, $price_format)+'</b></div></div><div class="row"><div class="col-12"><div class="minicart-drop-btns-wrap"><a href="/checkout" class="btn btn-primary btn-lg btn-block font-26">'+locales.go_to_checkout+'</a></div></div></div></div><div class="col-12 col-lg-4 order-lg-2 mt-3 mt-lg-0 secure-checkout"><div class="secure-title"><svg class="icon-lock-solid mr-1"><use xlink:href="#icon-lock-solid"></use></svg><span>100% Secure Checkout</span></div><div class="secure-icons text-center"><svg class="icon-secure-mcafee mr-2"><use xlink:href="#icon-secure-mcafee"></use></svg><svg class="icon-secure-norton"><use xlink:href="#icon-secure-norton"></use></svg></div></div><div class="col-12 col-lg-3 d-flex flex-lg-column order-lg-1 mt-3 mt-lg-0 payment-icons"><div class="d-flex mb-lg-2"><svg class="icon-payment-visa"><use xlink:href="#icon-payment-visa"></use></svg><svg class="icon-payment-mastercard"><use xlink:href="#icon-payment-mastercard"></use></svg><svg class="icon-payment-discover"><use xlink:href="#icon-payment-discover"></use></svg><svg class="icon-payment-amex"><use xlink:href="#icon-payment-amex"></use></svg></div><div class="d-flex"><svg class="icon-payment-paypal"><use xlink:href="#icon-payment-paypal"></use></svg><svg class="icon-payment-amazon-pay"><use xlink:href="#icon-payment-amazon-pay"></use></svg><svg class="icon-payment-apple-pay"><use xlink:href="#icon-payment-apple-pay"></use></svg><svg class="icon-payment-google-pay"><use xlink:href="#icon-payment-google-pay"></use></svg></div></div></div></div>');
  
      
      	$(cart_list).html($updated_list);
        currencyUpdate();
      
        $('[data-toggle="popover"]').on('click',function(e){
          e.preventDefault();
        }).popover();
    }
    else
    {
      $('.minicart-drop .holder .cart-empty').show();
      $('.minicart-drop .holder .minicart-drop-total').hide();
      $('.minicart-drop .holder .minicart-drop-content').hide();
      
        $('.minicart-drop .holder .cart-empty').html('<div class="cart-empty-icon"> <i class="icon icon-handbag"></i> </div> <div class="cart-empty-text"> <h3 class="cart-empty-title">'+locales.empty_minicart_text_1+'</h3> <p>'+locales.empty_minicart_text_2+' <a href="collections/all/">'+locales.empty_minicart_text_3+'</a></p> </div>');
    }
    $cart_subtotal.html(Shopify.formatMoney(CartJS.cart.total_price, $price_format));
    $cart_count.html(CartJS.cart.item_count);
}
function currencyUpdate(){
    if(jQuery('.selected-currency:first').length)
    {
        Currency.convertAll(shopCurrency, jQuery('.selected-currency:first').text());
    }
}

$(document).on('click','a.js-minicart-remove-item',function(e){
    CartJS.removeItem($(this).data('line-number'),{
        "success": function(data, textStatus, jqXHR) {
        },
        "error": function(jqXHR, textStatus, errorThrown) {
            $('#modalError span').text(errorThrown);
            $.fancybox.open({ src: '#modalError'})
        }
    })
    e.preventDefault();
})
$(document).on('click','.update_qty',function(e){
  	console.log('test');
  	console.log(e);
    CartJS.updateItemById($(this).data('variant-id'), $(this).prev().val(),{},{
        "success": function(data, textStatus, jqXHR) {
        },
        "error": function(jqXHR, textStatus, errorThrown) {
            $('#modalError span').text(errorThrown);
            $.fancybox.open({ src: '#modalError'})

        }
    });
    e.preventDefault();
})
$(document).on('cart.requestComplete', function(event, cart) {
    cartPopupUpdate();
    modalCheckoutUpdate();
    currencyUpdate();
});


function showProduct(delay,effect,selector){
    var delay = delay,
        effect = effect;
    $(selector).each(function(i) {
        var $this = $(this);
        setTimeout(function(){
            //$this.addClass(effect + ' animated');
        }, delay*i);
    });
}

function viewMode(viewmode) {
    var $grid = $('.grid-view', $(viewmode)),
        $list = $('.list-view', $(viewmode)),
        $products = $('.products-listview, .products-grid');
    if ($('.products-listview').length){
        $list.addClass('active');
    } else if ($('.products-grid').length){
        $grid.addClass('active');
    } else return false;
    $grid.on("click", function (e) {
        var $this = $(this);
        $products.addClass('no-animate');
        if(!$this.is('.active')){
            $list.removeClass('active');
            $this.addClass('active');
            $products.removeClass('products-listview').addClass('products-grid');
        }
        setTimeout(function() {
            $products.removeClass('no-animate');
        }, 500);
        e.preventDefault();
    });
    $list.on("click", function (e) {
        var $this = $(this);
        $products.addClass('no-animate');
        if(!$this.is('.active')){
            $grid.removeClass('active');
            $this.addClass('active');
            $products.removeClass('products-grid').addClass('products-listview');
        }
        setTimeout(function() {
            $products.removeClass('no-animate');
        }, 500);
        e.preventDefault();
    });
}

function countDownIni(countdown) {
    $(countdown).each(function () {
        var countdown = $(this);
        var promoperiod;
        if (countdown.attr('data-promoperiod')) {
            promoperiod = new Date().getTime() + parseInt(countdown.attr('data-promoperiod'), 10);
        } else if (countdown.attr('data-countdown')) {
            promoperiod = countdown.attr('data-countdown');
        }
        if (Date.parse(promoperiod) - Date.parse(new Date()) > 0) {
            countdown.countdown(promoperiod, function (event) {
                countdown.html(event.strftime('<span><span>%D</span>DAYS</span>' + '<span><span>%H</span>HRS</span>' + '<span><span>%M</span>MIN</span>' + '<span><span>%S</span>SEC</span>'));
            });
        }
    });
}
function renderPluralSingle(statement){
    var statement = statement;
    $('[data-text-plural]').each(function(){
        var $this = $(this),
            $target = $('.'+ $this.attr('data-count')),
            count = parseInt($target.html(),10),
            statementArray = statement.split(','),
            statementString = '';
        $.each(statementArray, function (index, value) {
            if($.isNumeric(value.substring(0))){
                statementString += 'count==' + value
            } else {
                statementString += 'count' + value
            }
            if (index !== (statementArray.length - 1)) {
                statementString += '||'
            }
        });
        if (eval(statementString)){
            $this.html($this.data('text-plural'))
        } else {
            $this.html($this.data('text-single'))
        }
    })
}
function updateProductCardSelectbox(select){
    $(select).each(function() {
        $select=$(this);
        $div=$('.product-select-'+$select.data('product-select'));
        $('div',$div).each(function(index,item) {
            $('option:eq('+index+')',$select).text($(this).text());
        })
    })
    $('.prd-action select').selectpicker('refresh');
}




/*--------------------------------SHOPIFY theme.js-----------------------------------*/

window.theme = window.theme || {};

/* ================ SLATE ================ */
window.theme = window.theme || {};

theme.Sections = function Sections() {
    this.constructors = {};
    this.instances = [];

    $(document)
        .on('shopify:section:load', this._onSectionLoad.bind(this))
        .on('shopify:section:unload', this._onSectionUnload.bind(this))
        .on('shopify:section:select', this._onSelect.bind(this))
        .on('shopify:section:deselect', this._onDeselect.bind(this))
        .on('shopify:block:select', this._onBlockSelect.bind(this))
        .on('shopify:block:deselect', this._onBlockDeselect.bind(this));
};



theme.customerTemplates = (function() {

    function initEventListeners() {
        // Show reset password form
        $('#RecoverPassword').on('click', function(evt) {
            evt.preventDefault();
            toggleRecoverPasswordForm();
        });

        // Hide reset password form
        $('#HideRecoverPasswordLink').on('click', function(evt) {
            evt.preventDefault();
            toggleRecoverPasswordForm();
        });
    }

    /**
     *
     *  Show/Hide recover password form
     *
     */
    function toggleRecoverPasswordForm() {
        $('#RecoverPasswordForm').toggleClass('hide');
        $('#CustomerLoginForm').toggleClass('hide');
    }

    /**
     *
     *  Show reset password success message
     *
     */
    function resetPasswordSuccess() {
        var $formState = $('.reset-password-success');

        // check if reset password form was successfully submited.
        if (!$formState.length) {
            return;
        }

        // show success message
        $('#ResetSuccess').removeClass('hide');
    }

    /**
     *
     *  Show/hide customer address forms
     *
     */
    function customerAddressForm() {
        var $newAddressForm = $('#AddressNewForm');

        if (!$newAddressForm.length) {
            return;
        }

        // Initialize observers on address selectors, defined in shopify_common.js
        if (Shopify) {
            // eslint-disable-next-line no-new
            new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
                hideElement: 'AddressProvinceContainerNew'
            });
        }

        // Initialize each edit form's country/province selector
        $('.address-country-option').each(function() {
            var formId = $(this).data('form-id');
            var countrySelector = 'AddressCountry_' + formId;
            var provinceSelector = 'AddressProvince_' + formId;
            var containerSelector = 'AddressProvinceContainer_' + formId;

            // eslint-disable-next-line no-new
            new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
                hideElement: containerSelector
            });
        });



        $('.address-edit-toggle').on('click', function() {
            var formId = $(this).data('form-id');
            $('#EditAddress_' + formId).toggleClass('hide');
        });

        $('.address-delete').on('click', function() {
            var $el = $(this);
            var formId = $el.data('form-id');
            var confirmMessage = $el.data('confirm-message');

            // eslint-disable-next-line no-alert
            if (confirm(confirmMessage || 'Are you sure you wish to delete this address?')) {
                Shopify.postLink('/account/addresses/' + formId, {parameters: {_method: 'delete'}});
            }
        });
    }

    /**
     *
     *  Check URL for reset password hash
     *
     */
    function checkUrlHash() {
        var hash = window.location.hash;

        // Allow deep linking to recover password form
        if (hash === '#recover') {
            toggleRecoverPasswordForm();
        }
    }

    return {
        init: function() {
            checkUrlHash();
            initEventListeners();
            resetPasswordSuccess();
            customerAddressForm();
        }
    };
})();

theme.init = function() {
    theme.customerTemplates.init();


};
$(function(){
    $(theme.init);
    $('.address-new-toggle').on('click', function() {
        $('#AddressNewForm').toggleClass('hide');
    });
    /*$('.product-card-selectbox').selectBox({
        topPositionCorrelation:0,
        keepInViewport:true
    });*/
})
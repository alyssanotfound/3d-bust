var scriptURL = 'js/buy-button-storefront.js';
  if (window.ShopifyBuy) {
    if (window.ShopifyBuy.UI) {
      ShopifyBuyInit();
    } else {
      loadScript();
    }
  } else {
    loadScript();
  }

  function loadScript() {
    var script = document.createElement('script');
    script.async = true;
    script.src = scriptURL;
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
    script.onload = ShopifyBuyInit;
  }

  function ShopifyBuyInit() {
    var client = ShopifyBuy.buildClient({
      domain: 'pokuasi-nyc.myshopify.com',
      apiKey: '453c9aa5993da2560880882cd6f4eb67',
      appId: '6',
    });

    ShopifyBuy.UI.onReady(client).then(function (ui) {
      ui.createComponent('product', {
        id: [9393870467],
        node: document.getElementById('product-component-21fa7a5ac51'),
        moneyFormat: '%24%7B%7Bamount%7D%7D',
        options: {
          "product": {
            "variantId": "all",
            // "width": "100%",
            "contents": {
              "img": false,
              "title": false,
              "variantTitle": false,
              "price": false,
              "description": false,
              "buttonWithQuantity": false,
              "quantity": false
            },
            "text": {
              "button": "PURCHASE"
            },
            // "styles": {
            //   "product": {
            //     "text-align": "center",
            //     "@media (min-width: 601px)": {
            //       "max-width": "100%",
            //       "margin-left": "0",
            //       "margin-bottom": "50px"
            //     }
            //   },
            //   "button": {
            //     "background-color": "#000000",
            //     "font-size": "15px",
            //     "padding-top": "15.5px",
            //     "padding-bottom": "15.5px",
            //     ":hover": {
            //       "background-color": "#000000"
            //     },
            //     ":focus": {
            //       "background-color": "#000000"
            //     }
            //   },
            //   "title": {
            //     "font-size": "26px"
            //   },
            //   "price": {
            //     "font-size": "18px"
            //   },
            //   "quantityInput": {
            //     "font-size": "15px",
            //     "padding-top": "15.5px",
            //     "padding-bottom": "15.5px"
            //   },
            //   "compareAt": {
            //     "font-size": "15px"
            //   }
            // }
          },
          "cart": {
            "contents": {
              "button": true
            },
            "text": {
              "title": "Reserved Items",
              "notice": "",
              "empty": "Nothing to purchase."
            },
            // "styles": {
            //   "button": {
            //     "background-color": "#000000",
            //     "font-size": "15px",
            //     "padding-top": "15.5px",
            //     "padding-bottom": "15.5px",
            //     ":hover": {
            //       "background-color": "#000000"
            //     },
            //     ":focus": {
            //       "background-color": "#000000"
            //     }
            //   },
            //   "footer": {
            //     "background-color": "#ffffff"
            //   }
            }
          },
          "modalProduct": {
            "contents": {
              "variantTitle": false,
              "buttonWithQuantity": true,
              "button": false,
              "quantity": false
            },
            // "styles": {
            //   "product": {
            //     "@media (min-width: 601px)": {
            //       "max-width": "100%",
            //       "margin-left": "0px",
            //       "margin-bottom": "0px"
            //     }
            //   },
            //   "button": {
            //     "background-color": "#000000",
            //     "font-size": "15px",
            //     "padding-top": "15.5px",
            //     "padding-bottom": "15.5px",
            //     ":hover": {
            //       "background-color": "#000000"
            //     },
            //     ":focus": {
            //       "background-color": "#000000"
            //     }
            //   },
            //   "quantityInput": {
            //     "font-size": "15px",
            //     "padding-top": "15.5px",
            //     "padding-bottom": "15.5px"
            //   }
            // }
          },
          // "toggle": {
          //   "styles": {
          //     "toggle": {
          //       "background-color": "#000000",
          //       ":hover": {
          //         "background-color": "#000000"
          //       },
          //       ":focus": {
          //         "background-color": "#000000"
          //       }
          //     },
          //     "count": {
          //       "font-size": "15px"
          //     }
          //   }
          // },
          // "productSet": {
          //   "styles": {
          //     "products": {
          //       "@media (min-width: 601px)": {
          //         "margin-left": "-20px"
          //       }
          //     }
          //   }
          // }
        // }
      });
    });
  }


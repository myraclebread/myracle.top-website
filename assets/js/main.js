(function ($) {
  var $window = $(window),
    $body = $("body"),
    $wrapper = $("#wrapper"),
    $header = $("#header"),
    $footer = $("#footer"),
    $main = $("#main"),
    $main_articles = $main.children("article");

  // Breakpoints.
  breakpoints({
    xlarge: ["1281px", "1680px"],
    large: ["981px", "1280px"],
    medium: ["737px", "980px"],
    small: ["481px", "736px"],
    xsmall: ["361px", "480px"],
    xxsmall: [null, "360px"],
  });

  // Play initial animations on page load.
  $window.on("load", function () {
    window.setTimeout(function () {
      $body.removeClass("is-preload");
    }, 100);
  });

  // Fix: Flexbox min-height bug on IE.
  if (browser.name == "ie") {
    var flexboxFixTimeoutId;
    $window
      .on("resize.flexbox-fix", function () {
        clearTimeout(flexboxFixTimeoutId);
        flexboxFixTimeoutId = setTimeout(function () {
          if ($wrapper.prop("scrollHeight") > $window.height())
            $wrapper.css("height", "auto");
          else $wrapper.css("height", "100vh");
        }, 250);
      })
      .triggerHandler("resize.flexbox-fix");
  }

  // Nav.
  var $nav = $header.children("nav"),
    $nav_li = $nav.find("li");

  if ($nav_li.length % 2 == 0) {
    $nav.addClass("use-middle");
    $nav_li.eq($nav_li.length / 2).addClass("is-middle");
  }

  // Main.
  var delay = 325,
    locked = false;

  // Methods.
  $main._show = function (id, initial) {
    var $article = $main_articles.filter("#" + id);

    if ($article.length == 0) return;

    if (locked || (typeof initial != "undefined" && initial === true)) {
      $body.addClass("is-switching");
      $body.addClass("is-article-visible");
      $main_articles.removeClass("active");
      $header.hide();
      $footer.hide();
      $main.show();
      $article.show();
      $article.addClass("active");
      locked = false;
      setTimeout(
        function () {
          $body.removeClass("is-switching");
        },
        initial ? 1000 : 0
      );

      return;
    }

    locked = true;

    if ($body.hasClass("is-article-visible")) {
      var $currentArticle = $main_articles.filter(".active");
      $currentArticle.removeClass("active");
      setTimeout(function () {
        $currentArticle.hide();
        $article.show();
        setTimeout(function () {
          $article.addClass("active");
          $window.scrollTop(0).triggerHandler("resize.flexbox-fix");
          setTimeout(function () {
            locked = false;
          }, delay);
        }, 25);
      }, delay);
    } else {
      $body.addClass("is-article-visible");
      setTimeout(function () {
        $header.hide();
        $footer.hide();
        $main.show();
        $article.show();
        setTimeout(function () {
          $article.addClass("active");
          $window.scrollTop(0).triggerHandler("resize.flexbox-fix");
          setTimeout(function () {
            locked = false;
          }, delay);
        }, 25);
      }, delay);
    }
  };

  $main._hide = function (addState) {
    var $article = $main_articles.filter(".active");

    if (!$body.hasClass("is-article-visible")) return;

    if (typeof addState != "undefined" && addState === true)
      history.pushState(null, null, "#");

    if (locked) {
      $body.addClass("is-switching");
      $article.removeClass("active");
      $article.hide();
      $main.hide();
      $footer.show();
      $header.show();
      $body.removeClass("is-article-visible");
      locked = false;
      $body.removeClass("is-switching");
      $window.scrollTop(0).triggerHandler("resize.flexbox-fix");
      return;
    }

    locked = true;

    $article.removeClass("active");

    setTimeout(function () {
      $article.hide();
      $main.hide();
      $footer.show();
      $header.show();
      setTimeout(function () {
        $body.removeClass("is-article-visible");
        $window.scrollTop(0).triggerHandler("resize.flexbox-fix");
        setTimeout(function () {
          locked = false;
        }, delay);
      }, 25);
    }, delay);
  };

function loadInventory() {
    var $tabLinks = $("#inventory-tab-links");
    var $tabContent = $("#inventory-tab-content");

    // Check if Konami code is active by looking for the body class
    var isBigShot = document.body.classList.contains("big-shot");
    
    // Choose the correct JSON file path
    var jsonPath = isBigShot ? "assets/data/spamton-uses.json" : "assets/data/uses.json";
    
    // We also need to clear the inventory if it's already loaded,
    // in case the user activates the code *while* on the /uses page.
    // This forces it to reload with the new file.
    if (isBigShot && $tabLinks.children().length > 0) {
        $tabLinks.empty();
        $tabContent.empty();
    }

    // Only load the content if the tabs are currently empty
    if ($tabLinks.children().length === 0) {
        
        // Use jQuery's getJSON to fetch the (now dynamic) file path
        $.getJSON(jsonPath, function (data) { // <--- VARIABLE IS USED HERE
            var $iconEl = $("#inventory-item-icon");
            var $nameEl = $("#inventory-item-name");
            var $descEl = $("#inventory-item-desc");
            var $flavorEl = $("#inventory-item-flavor");

            // Loop over categories with jQuery's .each
            $.each(data.categories, function (i, category) {
                // 1. Create the tab link
                // Made the ID safer for all characters
                var categoryId = category.title.toLowerCase().replace(/[^a-z0-9]/g, '-'); 
                var $tabLink = $(
                    `<div class="tab-link" data-tab="${categoryId}">${category.title}</div>`
                );
                $tabLinks.append($tabLink);

                // 2. Create the item list panel for this category
                var $itemList = $(`<div class="item-list" id="${categoryId}"></div>`);
                var inventoryHtml = "";

                // Loop over items in this category
                $.each(category.items, function (j, item) {
                    inventoryHtml += `
                        <div class="inventory-item" 
                            data-name="${item.name}" 
                            data-icon="${item.icon}" 
                            data-desc="${item.description}" 
                            data-flavor="${item.flavor}">
                            ${item.name}
                        </div>
                    `;
                });

                $itemList.html(inventoryHtml);
                $tabContent.append($itemList);
            });

            // 3. Add click handler for the tabs (ANIMATION LOGIC)
            $tabLinks.on("click", ".tab-link", function () {
                var $clickedTab = $(this);
                var tabId = $clickedTab.data("tab");

                if ($clickedTab.hasClass("active")) {
                    return;
                }

                $tabLinks.find(".tab-link").removeClass("active");
                $clickedTab.addClass("active");

                var $currentList = $tabContent.find(".item-list.active");
                var $nextList = $tabContent.find("#" + tabId);

                $currentList.removeClass("active");

                setTimeout(function() {
                    $nextList.addClass("active");
                    $nextList.find(".inventory-item").first().trigger("click");
                }, 300); // This MUST match your CSS transition duration
            });

            // 4. Add click handler for the items (no change)
            $tabContent.on("click", ".inventory-item", function () {
                var $itemEl = $(this);
                $itemEl.closest(".item-list").find(".inventory-item").removeClass("selected");
                $itemEl.addClass("selected");
                var itemData = $itemEl.data();
                $iconEl.attr("class", itemData.icon);
                $nameEl.text(itemData.name);
                $descEl.text(itemData.desc);
                $flavorEl.text(itemData.flavor);
            });

            // 5. Activate the first tab by default
            $tabLinks.find(".tab-link").first().addClass("active");
            var $firstList = $tabContent.find(".item-list").first();
            $firstList.addClass("active");
            $firstList.find(".inventory-item").first().trigger("click");

        }).fail(function () {
            console.error("Error loading inventory:", jsonPath);
            $tabLinks.html(
                "Error loading inventory. (Tell Kris to check the console!)"
            );
        });
    }
}

  // Articles.
  $main_articles.each(function () {
    var $this = $(this);
    $('<div class="close">Close</div>')
      .appendTo($this)
      .on("click", function () {
        location.hash = "";
      });
    $this.on("click", function (event) {
      event.stopPropagation();
    });
  });

  // Events.
  $body.on("click", function (event) {
    if ($body.hasClass("is-article-visible")) $main._hide(true);
  });

  $window.on("keyup", function (event) {
    switch (event.keyCode) {
      case 27:
        if ($body.hasClass("is-article-visible")) $main._hide(true);
        break;
      default:
        break;
    }
  });

  $window.on("hashchange", function (event) {
    if (location.hash == "" || location.hash == "#") {
      event.preventDefault();
      event.stopPropagation();
      $main._hide();
    } else if ($main_articles.filter(location.hash).length > 0) {
      event.preventDefault();
      event.stopPropagation();

      if (location.hash == "#uses") {
        loadInventory();
      }

      $main._show(location.hash.substr(1));
    }
  });

  // Scroll restoration.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  else {
    var oldScrollPos = 0,
      scrollPos = 0,
      $htmlbody = $("html,body");
    $window
      .on("scroll", function () {
        oldScrollPos = scrollPos;
        scrollPos = $htmlbody.scrollTop();
      })
      .on("hashchange", function () {
        $window.scrollTop(oldScrollPos);
      });
  }

  // Initialize.
  $main.hide();
  $main_articles.hide();

  if (location.hash != "" && location.hash != "#")
    $window.on("load", function () {
      if (location.hash == "#uses") {
        loadInventory();
      }
      $main._show(location.hash.substr(1), true);
      s;
    });
})(jQuery);

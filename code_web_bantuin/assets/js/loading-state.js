// Loading state manager
(function () {
  "use strict";

  var loadingCount = 0;
  var loadingEl = null;

  function createLoadingElement() {
    var div = document.createElement("div");
    div.id = "global-loading";
    div.style.cssText =
      "position:fixed;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#06b6d4,#0891b2);transform:scaleX(0);transform-origin:left;transition:transform 0.3s ease;z-index:9999;";
    document.body.appendChild(div);
    return div;
  }

  function showLoading() {
    loadingCount++;
    if (!loadingEl) loadingEl = createLoadingElement();
    loadingEl.style.transform = "scaleX(0.7)";
  }

  function hideLoading() {
    loadingCount--;
    if (loadingCount <= 0) {
      loadingCount = 0;
      if (loadingEl) {
        loadingEl.style.transform = "scaleX(1)";
        setTimeout(function () {
          if (loadingEl) loadingEl.style.transform = "scaleX(0)";
        }, 300);
      }
    }
  }

  // Expose globally
  window.LoadingState = {
    show: showLoading,
    hide: hideLoading,

    // Wrap async operation with loading state
    wrap: function (asyncFn) {
      return function () {
        showLoading();
        var args = arguments;
        var self = this;

        try {
          var result = asyncFn.apply(self, args);

          // Handle promise
          if (result && typeof result.then === "function") {
            return result
              .then(function (res) {
                hideLoading();
                return res;
              })
              .catch(function (err) {
                hideLoading();
                throw err;
              });
          }

          hideLoading();
          return result;
        } catch (e) {
          hideLoading();
          throw e;
        }
      };
    },

    // Button loading state
    setButtonLoading: function (button, isLoading) {
      if (!button) return;

      if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.innerHTML =
          '<span style="display:inline-flex;align-items:center;gap:8px;"><span style="width:14px;height:14px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;"></span>Memproses...</span>';

        // Add spin animation if not exists
        if (!document.getElementById("btn-loading-style")) {
          var style = document.createElement("style");
          style.id = "btn-loading-style";
          style.textContent = "@keyframes spin{to{transform:rotate(360deg)}}";
          document.head.appendChild(style);
        }
      } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText || button.textContent;
      }
    },
  };

  console.log("Loading state manager initialized");
})();

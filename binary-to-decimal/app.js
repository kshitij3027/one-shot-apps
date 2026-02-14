(function () {
  "use strict";

  var binaryInput = document.getElementById("binary-input");
  var decimalOutput = document.getElementById("decimal-output");
  var errorMessage = document.getElementById("error-message");

  function binaryToDecimal(str) {
    var decimal = 0;
    for (var i = 0; i < str.length; i++) {
      if (str[i] === "1") {
        decimal += Math.pow(2, str.length - 1 - i);
      }
    }
    return decimal;
  }

  function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.hidden = false;
    binaryInput.classList.add("error");
  }

  function hideError() {
    errorMessage.textContent = "";
    errorMessage.hidden = true;
    binaryInput.classList.remove("error");
  }

  function setOutput(value) {
    decimalOutput.value = value;
    if (value !== "") {
      decimalOutput.classList.add("has-value");
    } else {
      decimalOutput.classList.remove("has-value");
    }
  }

  binaryInput.addEventListener("input", function () {
    var value = binaryInput.value.trim();

    if (value === "") {
      hideError();
      setOutput("");
      return;
    }

    if (!/^[01]+$/.test(value)) {
      showError("Only 0s and 1s are allowed");
      setOutput("");
      return;
    }

    hideError();
    setOutput(binaryToDecimal(value));
  });
})();

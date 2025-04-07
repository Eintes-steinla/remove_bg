const themeToggle = document.getElementById("themeToggle");
const langToggle = document.getElementById("langToggle");
const langDropdown = document.getElementById("langDropdown");
const currentLangText = document.getElementById("currentLang");
const html = document.documentElement;

const languageNames = {
  vi: "Tiếng Việt",
  en: "English",
  zh: "中文",
};

// Check for saved theme preference, otherwise use system preference
if (
  localStorage.theme === "dark" ||
  (!("theme" in localStorage) &&
    window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
  html.classList.add("dark");
} else {
  html.classList.remove("dark");
}

// Language management
const setLanguage = (lang) => {
  html.setAttribute("lang", lang);
  document.querySelectorAll("[data-lang]").forEach((el) => {
    if (el.dataset.lang === lang) {
      el.classList.remove("hidden");
    } else {
      el.classList.add("hidden");
    }
  });
  currentLangText.textContent = languageNames[lang];
  localStorage.setItem("language", lang);
  langDropdown.classList.add("hidden");
};

// Handle dropdown toggle
langToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  langDropdown.classList.toggle("hidden");
});

// Close dropdown when clicking outside
document.addEventListener("click", () => {
  langDropdown.classList.add("hidden");
});

// Handle language selection
document.querySelectorAll("[data-lang-choice]").forEach((button) => {
  button.addEventListener("click", (e) => {
    setLanguage(e.target.dataset.langChoice);
  });
});

// Initialize language
const savedLang = localStorage.getItem("language") || "vi";
setLanguage(savedLang);

// Handle theme toggle
themeToggle.addEventListener("click", () => {
  html.classList.toggle("dark");
  localStorage.theme = html.classList.contains("dark") ? "dark" : "light";
});

let originalImage = null;
let resultImage = null;

// Xử lý sự kiện kéo và thả
const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("fileInput");
const removeBtn = document.getElementById("removeBackgroundBtn");
const downloadBtn = document.getElementById("downloadBtn");
const originalImg = document.getElementById("originalImg");
const resultImg = document.getElementById("resultImg");

// Ngăn chặn hành vi kéo thả mặc định
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Highlight khu vực kéo thả khi kéo file vào
["dragenter", "dragover"].forEach((eventName) => {
  dropArea.addEventListener(eventName, highlight, false);
});

["dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight() {
  dropArea.classList.add("border-blue-600", "bg-blue-50");
  dropArea.classList.remove("border-gray-300", "bg-white");
}

function unhighlight() {
  dropArea.classList.remove("border-blue-600", "bg-blue-50");
  dropArea.classList.add("border-gray-300", "bg-white");
}

// Xử lý khi thả file
dropArea.addEventListener("drop", handleDrop, false);

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles(files);
}

fileInput.addEventListener("change", function () {
  handleFiles(this.files);
});

function showError(viMsg, enMsg, zhMsg) {
  const currentLang = html.getAttribute("lang");
  const messages = {
    vi: viMsg,
    en: enMsg,
    zh: zhMsg,
  };
  alert(messages[currentLang]);
}

function handleFiles(files) {
  if (files.length > 0) {
    const file = files[0];
    if (file.type.match("image.*")) {
      previewFile(file);
      removeBtn.disabled = false;
    } else {
      showError(
        "Vui lòng chọn file ảnh.",
        "Please select an image file.",
        "请选择图片文件。"
      );
    }
  }
}

function previewFile(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    originalImg.src = e.target.result;
    originalImage = file; // Lưu file gốc để gửi lên server
    resultImg.src = ""; // Xóa ảnh kết quả cũ nếu có
    downloadBtn.style.display = "none";
  };
  reader.readAsDataURL(file);
}

// Xử lý xóa nền
removeBtn.addEventListener("click", removeBackground);

function removeBackground() {
  if (!originalImage) {
    showError(
      "Vui lòng chọn một ảnh trước.",
      "Please select an image first.",
      "请先选择一张图片。"
    );
    return;
  }

  const formData = new FormData();
  formData.append("image", originalImage);

  removeBtn.disabled = true;
  const currentLang = html.getAttribute("lang");

  const processingText = {
    vi: "Đang xử lý...",
    en: "Processing...",
    zh: "处理中...",
  };

  const buttonText = {
    vi: "Xóa nền ảnh",
    en: "Remove Background",
    zh: "去除背景",
  };

  removeBtn.textContent = processingText[currentLang];

  fetch("/api/remove-background", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.blob();
    })
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      resultImg.src = url;
      resultImage = url;

      removeBtn.textContent = buttonText[currentLang];
      removeBtn.disabled = false;
      downloadBtn.style.display = "block";
    })
    .catch((error) => {
      console.error("Error:", error);
      showError(
        "Có lỗi xảy ra khi xóa nền ảnh.",
        "An error occurred while removing the background.",
        "去除背景时发生错误。"
      );
      removeBtn.textContent = buttonText[currentLang];
      removeBtn.disabled = false;
    });
}

// Xử lý tải ảnh xuống
downloadBtn.addEventListener("click", function () {
  if (resultImage) {
    const a = document.createElement("a");
    a.href = resultImage;
    a.download = "removebg.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
});

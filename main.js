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
  dropArea.style.borderColor = "#0078d7";
  dropArea.style.backgroundColor = "#f0f8ff";
}

function unhighlight() {
  dropArea.style.borderColor = "#ccc";
  dropArea.style.backgroundColor = "white";
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

function handleFiles(files) {
  if (files.length > 0) {
    const file = files[0];
    if (file.type.match("image.*")) {
      previewFile(file);
      removeBtn.disabled = false;
    } else {
      alert("Vui lòng chọn file ảnh.");
    }
  }
}

function previewFile(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    originalImg.src = e.target.result;
    originalImage = e.target.result;
    resultImg.src = "/api/placeholder/400/320";
    downloadBtn.style.display = "none";
  };
  reader.readAsDataURL(file);
}

// Xử lý xóa nền
removeBtn.addEventListener("click", removeBackground);

function removeBackground() {
  const formData = new FormData();
  formData.append("image_file", fileInput.files[0]);

  removeBtn.disabled = true;
  removeBtn.textContent = "Đang xử lý...";

  fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "X-Api-Key": "",
    },
    body: formData,
  })
    .then((response) => response.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      resultImg.src = url;
      resultImage = url;

      removeBtn.textContent = "Xóa nền ảnh";
      removeBtn.disabled = false;
      downloadBtn.style.display = "block";
    })
    .catch((error) => {
      console.error("Lỗi:", error);
      alert("Có lỗi xảy ra khi xóa nền ảnh.");
      removeBtn.textContent = "Xóa nền ảnh";
      removeBtn.disabled = false;
    });
}

// Xử lý tải ảnh xuống
downloadBtn.addEventListener("click", function () {
  if (resultImage) {
    const a = document.createElement("a");
    a.href = resultImage;
    a.download = "anh-da-xoa-nen.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
});

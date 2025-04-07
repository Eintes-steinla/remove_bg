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
    alert("Vui lòng chọn một ảnh trước.");
    return;
  }

  const formData = new FormData();
  formData.append("image", originalImage);

  removeBtn.disabled = true;
  removeBtn.textContent = "Đang xử lý...";

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

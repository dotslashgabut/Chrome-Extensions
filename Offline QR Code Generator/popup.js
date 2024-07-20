document.addEventListener('DOMContentLoaded', function() {
  const dataTypeSelect = document.getElementById('dataType');
  const inputFields = document.getElementById('inputFields');
  const errorMessage = document.getElementById('errorMessage');
  const generateButton = document.getElementById('generate');
  const qrcodeDiv = document.getElementById('qrcode');
  const qrPreview = document.getElementById('qrPreview');
  const savePNGButton = document.getElementById('savePNG');

  let qr = null;

  const inputTemplates = {
    text: '<input type="text" id="inputData" placeholder="Enter text">',
    url: '<input type="url" id="inputData" placeholder="Enter URL">',
    email: '<input type="email" id="inputData" placeholder="Enter email">',
    phone: '<input type="tel" id="inputData" placeholder="Enter phone number">',
    wifi: `
      <input type="text" id="ssid" placeholder="SSID">
      <input type="password" id="password" placeholder="Password">
      <select id="encryption">
        <option value="WPA">WPA/WPA2</option>
        <option value="WEP">WEP</option>
        <option value="nopass">No Encryption</option>
      </select>
    `,
    contact: `
      <input type="text" id="name" placeholder="Name">
      <input type="tel" id="phone" placeholder="Phone">
      <input type="email" id="email" placeholder="Email">
      <input type="text" id="address" placeholder="Address">
    `
  };

  dataTypeSelect.addEventListener('change', updateInputFields);

  function updateInputFields() {
    const dataType = dataTypeSelect.value;
    inputFields.innerHTML = inputTemplates[dataType];
  }

  function validateInput(dataType) {
    const getValue = id => document.getElementById(id).value;
    switch(dataType) {
      case 'text':
        return getValue('inputData').trim() !== '';
      case 'url':
        return /^(https?:\/\/)?([\w.-]+)(:\d+)?([\w\d\s\/\-._~:\/?#[\]@!$&'()*+,;=]*)$/.test(decodeURIComponent(getValue('inputData')));
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(getValue('inputData'));
      case 'phone':
        return /^\+?[\d\s()-]{10,}$/.test(getValue('inputData'));
      case 'wifi':
        return getValue('ssid').trim() !== '' && (getValue('encryption') === 'nopass' || getValue('password').trim() !== '');
      case 'contact':
        return getValue('name').trim() !== '' && (getValue('phone').trim() !== '' || getValue('email').trim() !== '');
    }
  }

  function getQRData(dataType) {
    const getValue = id => document.getElementById(id).value;
    switch(dataType) {
      case 'text':
      case 'url':
      case 'email':
      case 'phone':
        return getValue('inputData');
      case 'wifi':
        return `WIFI:T:${getValue('encryption')};S:${getValue('ssid')};P:${getValue('password')};;`;
      case 'contact':
        return `BEGIN:VCARD
VERSION:3.0
FN:${getValue('name')}
TEL:${getValue('phone')}
EMAIL:${getValue('email')}
ADR:${getValue('address')}
END:VCARD`;
    }
  }

  generateButton.addEventListener('click', function() {
    const dataType = dataTypeSelect.value;
    if (!validateInput(dataType)) {
      errorMessage.textContent = 'Please enter valid data for the selected type.';
      qrPreview.style.display = 'none';
      return;
    }
    errorMessage.textContent = '';

    const qrData = getQRData(dataType);

    qrcodeDiv.innerHTML = '';
    qr = new QRCode(qrcodeDiv, {
      text: qrData,
      width: 156,
      height: 156,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });

    qrPreview.style.display = 'block';
  });

  savePNGButton.addEventListener('click', function() {
    if (!qr) return;
    const img = new Image();
    img.src = qrcodeDiv.querySelector('img').src;
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const borderSize = 10; // Adjust the border size as needed
      canvas.width = img.width + 2 * borderSize;
      canvas.height = img.height + 2 * borderSize;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, borderSize, borderSize);
      const dataUrl = canvas.toDataURL('image/png');
      chrome.downloads.download({
        url: dataUrl,
        filename: 'qrcode.png'
      });
    };
  });

  updateInputFields();
});
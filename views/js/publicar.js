function previewFile() {
    var preview = document.getElementById('previow-imagem');
    var file    = document.querySelector('input[type=file]').files[0];
    var reader  = new FileReader();
  
    reader.onloadend = function () {
      preview.src = reader.result;
    }
  
    if (file) {
      reader.readAsDataURL(file);
    } else {
      preview.src = "";
    }
  }

const hoje = new Date();
      
      // Formata a data no formato YYYY-MM-DD
      const dia = String(hoje.getDate()).padStart(2, '0');
      const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
      const ano = hoje.getFullYear();
      
      const dataFormatada = `${ano}-${mes}-${dia}`;
      
      // Define o valor do input para a data atual
      document.getElementById('data-publicacao').value = dataFormatada;
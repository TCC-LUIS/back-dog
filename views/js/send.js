
// Função para verificar a autenticação
function verificarAutenticacao() {
  const token = localStorage.getItem('token'); // Obtém o token do armazenamento local

  if (!token) {
    alert('Usuário não está logado.');
    window.location.href = 'login.html'; // Redireciona para a página de login
    return false;
  }
  
  return true;
}

// Função para validar o usuário antes de carregar a página
document.addEventListener('DOMContentLoaded', function () {
  if (!verificarAutenticacao()) return; // Verifica a autenticação ao carregar a página

  const emailU = localStorage.getItem('email'); // Recupera o email do usuário
  if (!emailU) {
    alert('Usuário não identificado. Faça login novamente.');
    window.location.href = 'login.html';
    return;
  }

  // Exibe o email do usuário logado na página
  const user = document.getElementById('user');
  user.innerHTML = `Publicando como ${emailU}`;
});

// Manipulação do formulário
const pub = document.getElementById('pub');
pub.addEventListener('submit', async function (event) {
  event.preventDefault(); // Impede o envio padrão do formulário

  // Verifica a autenticação antes de enviar o formulário
  if (!verificarAutenticacao()) return; // Se não estiver autenticado, interrompe o envio

  const emailU = localStorage.getItem('email'); // Obtém o email do usuário
  if (!emailU) {
    alert('Usuário não identificado. Faça login novamente.');
    return;
  }

  // Cria o FormData para enviar os dados do formulário
  const formData = new FormData(); 
  formData.append('email', emailU);
  formData.append('title', document.getElementById('titulo').value);
  formData.append('publisher', document.getElementById('editora').value);
  formData.append('type', document.getElementById('genero').value);
  formData.append('indicative_classification', Number(document.getElementById('classificacaoIndicativa').value));
  formData.append('language', document.getElementById('idioma').value);
  formData.append('pages', Number(document.getElementById('numeroPaginas').value));
  formData.append('synopsis', document.getElementById('sinopse').value);
  formData.append('price', Number(document.getElementById('preco').value));
  formData.append('file', document.getElementById('capa').files[0]); // Envia o arquivo de imagem

  // Obtenha o token do localStorage
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Token inválido ou expirado. Por favor, faça login novamente.');
    window.location.href = 'login.html'; // Redireciona para login se o token for inválido
    return;
  }

  try {
    const response = await fetch('http://localhost:4000/send', {
      method: 'POST',
      body: formData, // Envia os dados como FormData
      headers: {
        Authorization: `Bearer ${token}` // Inclui o JWT no cabeçalho da requisição
      }
    });

    if (response.ok) {
      const data = await response.json();
      alert('Formulário enviado com sucesso!');
      console.log('Dados recebidos do servidor:', data); // Exibe os dados retornados para depuração
    } else {
      const errorData = await response.json();
      alert('Erro ao enviar o formulário.');
      console.error('Erro do servidor:', errorData.message || response.statusText);
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    alert('Erro ao tentar enviar o formulário. Tente novamente mais tarde.');
  }
});
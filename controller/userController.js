const User = require('../models/usuario')
const Book = require("../models/Livro")
const fs = require('fs')
const path = require('path') // Importa path para manipular caminhos de arquivos
require('dotenv').config()
const jwt = require('jsonwebtoken')

const secret = process.env.SECRET

exports.create = async (req, res) => {
  try {
    // Desestruturação dos dados do corpo da requisição
    const { name, email, password, sumary, favorite_book } = req.body

    // Verifica se o arquivo de foto de perfil foi enviado
    const profilePicture = req.file
    if (!profilePicture) {
      return res.status(400).json({ message: 'Foto de perfil ausente.' })
    }

    // Lê os dados do arquivo e converte para Buffer
    const profilePictureData = fs.readFileSync(profilePicture.path)

    // Criação do usuário no banco de dados
    const user = await User.create({
      name,
      email,
      password, // Recomenda-se criptografar a senha antes de salvar no banco
      sumary,
      favorite_book,
      profile_pictures: profilePictureData // Salva a foto no campo correto
    })

    // Remove o arquivo temporário após salvar os dados
    fs.unlinkSync(profilePicture.path)

    // Retorna o usuário criado (sem expor a senha)
    const { id, name: userName, email: userEmail } = user
    res.status(200).json({
      message: 'Usuário criado com sucesso!',
      user: { id, name: userName, email: userEmail }
    })
  } catch (error) {
    console.error('Erro ao captar dados:', error)

    // Retorna erro no caso de falha
    res.status(500).json({
      message: 'Erro ao criar o usuário.',
      error: error.message
    })
  }
}

// Middleware para verificar o token JWT
exports.verify = function verifyJWT(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ auth: false, message: 'No token provided.' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      const message =
        err.name === 'TokenExpiredError'
          ? 'Token expired, please log in again.'
          : 'Failed to authenticate token.';
      return res.status(401).json({ auth: false, message });
    }

    // Ao invés de armazenar só o `id`, vamos armazenar o objeto completo decodificado (payload do token)
    req.user = decoded; // Armazena o objeto decodificado inteiro em `req.user`
    next();
  });
};

// Função para validar o usuário e gerar um token
exports.validateUser = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ where: { email } })

    if (!user || password !== user.password) {
      return res
        .status(401)
        .json({ auth: false, message: 'Senha ou usuário incorretos!' })
    }

    const token = jwt.sign({ id: user.id }, secret, {
      expiresIn: 10 * 60 // Expira em 10 minutos
    })

    return res.json({
      auth: true,
      token,
      user: {
        name: user.name,
        profile_pictures: user.profile_pictures
          ? user.profile_pictures.toString('base64')
          : null
      }
    })
  } catch (error) {
    console.error('Erro ao logar:', error)
    return res.status(500).json({ auth: false, message: 'Erro no servidor.' })
  }
}

exports.getUser = async (req,res) => {
  try {
    const userId = req.user.id
    const user = await User.findByPk(userId); // Ajuste para `req.user.id`
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const books = await Book.findAll({where: {writer: user.name} }); // Ajuste conforme o modelo e consulta necessários

    // Formatar os livros com a capa convertida em base64 e outros campos
    const formattedBooks = books.map(book => ({
      id: book.id,
      title: book.title, // Nome do livro
      writer: book.writer, // Autor
      publisher: book.publisher, // Editora
      type: book.type, // Tipo
      language: book.language, // Idioma
      pages: book.pages, // Páginas
      date: book.date, // Data de publicação
      synopsis: book.synopsis, // Sinopse
      price: book.price, // Preço
      cover: book.cover ? book.cover.toString('base64') : null, // Capa convertida para base64
      rating: book.rating, // Avaliação (se existir)
      indicative_classification: book.indicative_classification, // Classificação indicativa (se existir)
      status: book.status // Status do livro (se aplicável)
    }));

    // Retornar a resposta com os livros e informações do usuário
    return res.json({
      auth: true,
      books: formattedBooks, // Livros formatados com a capa e dados necessários
      user: {
        username: user.name, // Nome do usuário
        sumary: user.sumary,
        email: user.email,
        favorite_book: user.favorite_book,
        profilePicture: user.profile_pictures // Foto de perfil do usuário
          ? user.profile_pictures.toString('base64')
          : null
      }
    });
  } catch (error) {
    console.log("erro ao captar usuário"+ error);
  }
}

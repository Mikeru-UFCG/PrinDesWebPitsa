const express = require('express');
const router = express.Router();
const EntregadorController = require('../controllers/EntregadorController');
const authMiddleware = require('../middlewares/authMiddleware'); // Importa o middleware

/**
 * @swagger
 * tags:
 *   name: Entregadores
 *   description: API para gerenciamento de entregadores
 */

/**
 * @swagger
 * /entregadores:
 *   post:
 *     summary: Cria um novo entregador
 *     tags: [Entregadores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Entregador'
 *     responses:
 *       201:
 *         description: Entregador criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/entregadores', authMiddleware(['estabelecimento']), EntregadorController.createEntregador);

/**
 * @swagger
 * /entregadores/{id}:
 *   put:
 *     summary: Atualiza um entregador pelo ID
 *     tags: [Entregadores]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do entregador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Entregador'
 *     responses:
 *       200:
 *         description: Entregador atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Entregador não encontrado
 */
router.put('/entregadores/:id', authMiddleware(['estabelecimento']), EntregadorController.updateEntregador);

/**
 * @swagger
 * /entregadores/{id}:
 *   delete:
 *     summary: Remove um entregador pelo ID
 *     tags: [Entregadores]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do entregador
 *     responses:
 *       204:
 *         description: Entregador removido com sucesso
 *       404:
 *         description: Entregador não encontrado
 */
router.delete('/entregadores/:id', authMiddleware(['estabelecimento']), EntregadorController.deleteEntregador);

/**
 * @swagger
 * /entregadores/{id}:
 *   get:
 *     summary: Retorna um entregador pelo ID
 *     tags: [Entregadores]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do entregador
 *     responses:
 *       200:
 *         description: Entregador encontrado
 *       404:
 *         description: Entregador não encontrado
 */
router.get('/entregadores/:id', authMiddleware(['estabelecimento']), EntregadorController.getEntregador);

/**
 * @swagger
 * /entregadores/{id}/disponibilidade:
 *   put:
 *     summary: Define a disponibilidade do entregador
 *     tags: [Entregadores]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do entregador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               disponibilidade:
 *                 type: string
 *                 enum: [Ativo, Descanso]
 *                 description: Estado de disponibilidade do entregador
 *     responses:
 *       200:
 *         description: Disponibilidade do entregador definida com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Entregador não encontrado
 */
router.put('/entregadores/:id/disponibilidade', authMiddleware(['entregador']), EntregadorController.definirDisponibilidade);

// Rotas públicas (não protegidas por autenticação)
router.post('/entregadores/register', EntregadorController.register);
router.post('/entregadores/login', EntregadorController.login);

module.exports = router;

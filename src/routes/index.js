import express from 'express'

import call from './call.route'

const router = express.Router()

router.use('/call', call)

export default router

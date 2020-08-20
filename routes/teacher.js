const express = require('express');
const router = express.Router();
const { getRegister,postRegister, getLogin, postLogin, getLogout, findStudents, viewProfile, getNotifications, followUser, unfollowUser} = require('../controllers/teacher');

router.get('/signup', getRegister);

router.post('/signup', postRegister);

router.get('/login', getLogin);

router.post('/login', postLogin);

router.get('/', (req, res, next) => {
    res.render('teacher/index');
});

router.get('/find', findStudents);

router.get('/view/:id', viewProfile);

router.post('/:id/follow', followUser);
router.post('/:id/unfollow', unfollowUser);

router.get('/notifications', getNotifications);

router.get('/logout', getLogout);

module.exports = router;
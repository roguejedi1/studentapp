const Student = require('../models/student');
const mongoose = require('mongoose');
const passport = require('passport');
const Teacher = require('../models/teacher');
const FollowNotification = require('../models/FollowNotif');
const socketApi = require('../socket');
const onlineUsers = require('../onlineUsers');

module.exports = {
    getLogin(req, res, next) {
        res.render('student/login');
    },
    async postLogin(req, res, next) {
        const { username, password } = req.body;
        const { user, error } = await Student.authenticate()(username, password);
        if (!user && error) return next(error);
        req.login(user, function (err) {
            if (err) return next(err);
            const redirectUrl = req.session.redirectTo || '/student/';
            delete req.session.redirectTo;
            res.redirect(redirectUrl);
        });
    },
    getRegister(req, res, next) {
        res.render('student/signup');
    },
    async postRegister(req, res, next) {
        const user = await Student.register(new Student(req.body), req.body.password);
        req.login(user, function (err) {
            if (err) return next(err);
            res.redirect('/student/');
        });
    },
    getLogout(req, res, next) {
        req.logout();
        res.redirect('/');
    },
    async findTeacher(req, res, next){
        let teacher = await Teacher.find({}).exec();
        res.render('student/find', {teacher});
    },
    async viewProfile(req, res, next){
        let teacher = await Teacher.findById(req.params.id);
        res.render('student/view', {teacher});
    },
    getNotifications(req, res, next) {
        res.render('student/notifications');
    },
    async followUser(req, res, next){
        try {
            let userToFollow = await Teacher.findById(req.params.id);
            let currentUser = await Student.findById(req.user._id);
            const newNotificiation = await FollowNotification.create({
                read: false,
                message: `${currentUser.username} followed you`,
                senderUserId: currentUser._id,
                recieverUserId: userToFollow._id
            });
            await userToFollow.followers.addToSet(currentUser);
            await userToFollow.notifications.push(newNotificiation);
            await userToFollow.save();
            await currentUser.following.addToSet(userToFollow);
            await currentUser.save();
            res.redirect('back');
        } catch (err) {
            next(err);
        }
    },
    async unfollowUser(req, res, next){
        try {
            let userToUnfollow = await Teacher.findById(req.params.id).populate('folllowers').populate('notifications');
            let currentUser = await Student.findById(req.user._id).populate('folllowing');

            const newNotificationArray = userToUnfollow.notifications.filter(({ senderUserId, __t }) => (userToUnfollow.toString() !== currentUser._id.toString()) && (__t !== "FollowNotif"));

            userToUnfollow.notifications = newNotificationArray;
            await userToUnfollow.followers.remove({ _id: currentUser._id });
            await currentUser.following.remove({ _id: userToUnfollow._id });
            await userToUnfollow.save();
            await currentUser.save();
            res.redirect("back");
        } catch (err) {
            next(err);
        }
    },
    async matchCheck(req, res, next){
        let currentUser = await Student.findById(req.user._id);
        let currentUserFollowers = currentUser.followers;
        let currentUserFollowing = currentUser.following;
        let mutualFriends = currentUserFollowers.filter((currentUserFollower) => currentUserFollowing.includes(currentUserFollower));
        let newFriends = await Teacher.find().where('_id').in(mutualFriends).exec();
        res.render('student/friends', {newFriends});
    }
}
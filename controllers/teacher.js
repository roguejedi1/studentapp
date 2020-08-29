const Teacher = require('../models/teacher');
const passport = require('passport');
const mongoose = require('mongoose');
const Student = require('../models/student');
// The person sending notifs is the teacher so ref tFollowNotif
const FollowNotification = require('../models/tFollowNotif');
const onlineUsers = require('../onlineUsers');
const socketApi = require('../socket');

module.exports = {
    getLogin(req, res, next){
        res.render('teacher/login');
    },
    async postLogin(req, res, next){
        const { username, password } = req.body;
        const { user, error } = await Teacher.authenticate()(username, password);
        if (!user && error) return next(error);
        req.login(user, function (err) {
            if (err) return next(err);
            const redirectUrl = req.session.redirectTo || '/teacher/';
            delete req.session.redirectTo;
            res.redirect(redirectUrl);
        });
    },
    getRegister(req, res, next){
        res.render('teacher/signup');
    },
    async postRegister(req, res, next){
        const user = await Teacher.register(new Teacher(req.body), req.body.password);
        req.login(user, function (err) {
            if (err) return next(err);
            res.redirect('/teacher/');
        });
    },
    getLogout(req, res, next){
        req.logout();
        res.redirect('/');
    },
    async findStudents(req, res, next){
        let student = await Student.find({}).exec();
        res.render('teacher/find', {student});
    },
    async viewProfile(req, res, next){
        let student = await Student.findById(req.params.id);
        res.render('teacher/view', {student});
    },
    getNotifications(req, res, next){
        res.render('teacher/notifications');
    },
    async followUser(req, res, next){
        try {
            let userToFollow = await Student.findById(req.params.id);
            let currentUser = await Teacher.findById(req.user._id);
            const newNotification = await FollowNotification.create({
                read: false,
                message: `${currentUser.username} followed you`,
                senderUserId: currentUser._id,
                recieverUserId: userToFollow._id
            });
            await userToFollow.followers.addToSet(currentUser);
            await userToFollow.notifications.push(newNotification);
            await userToFollow.save();
            await currentUser.following.addToSet(userToFollow);
            await currentUser.save();
            const stringId = userToFollow._id.toString()

            if (onlineUsers.has(stringId)) {
                socketApi.sendNotification(newNotification, onlineUsers.get(stringId));
            }
            else console.log("User you have followed is offline");
            res.redirect("back");

        } catch (err) {
            next(err);
        }
    },
    async unfollowUser(req, res, next){
        try {
            let userToUnfollow = await Student.findById(req.params.id).populate('followers').populate('notifications');
            let currentUser = await Teacher.findById(req.user._id).populate('following');

            const newNotificationArray = userToUnfollow.notifications.filter(({ senderUserId, __t }) => (userToUnfollow.toString() !== currentUser._id.toString()) && (__t !== "tFollowNotif"));

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
        let currentUser = await Teacher.findById(req.user._id);
        let currentUserFollowers = currentUser.followers;
        let currentUserFollowing = currentUser.following;
        let mutualFriends = currentUserFollowers.filter((currentUserFollower) => currentUserFollowing.includes(currentUserFollower));
        let newFriends = await Student.find().where('_id').in(mutualFriends).exec();
        res.render('teacher/friends', {newFriends});
    }
}
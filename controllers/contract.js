const Teacher = require('../models/teacher');
const Student = require('../models/student');
const Contract = require('../models/contract');
const Recieved = require('../models/sRecieved');
const mongoose = require('mongoose');
const OnlineUsers = require('../onlineUsers');
const SocketApi = require('../socket');

module.exports = {
    async getContract(req, res, next){
        let student = await Student.findById(req.params.id);
        let contract = await Contract.findById(req.params.id);
        res.render('teacher/contract', {student});
    },
    async createContract(req, res, next){
        let currentUser = await Teacher.findById(req.user._id);
        req.body.contract.teacher = currentUser;
        let userToSend = await Student.findById(req.params.id);
        let contract = await Contract.create(req.body.contract);
        const newNotif = await Recieved.create({
            read: false,
            message: `${currentUser.username} sent an enrolment contract`,
            senderUserId: currentUser._id,
            recieverUserId: userToSend._id,
            contractId: contract._id 
        })
        await userToSend.notifications.push(newNotif);
        await userToSend.save();

        const stringId = userToSend._id.toString();
        if(OnlineUsers.has(stringId)){
            SocketApi.sendNotification(newNotif, OnlineUsers.get(stringId));
        }
        else console.log('user is offline');

        res.redirect(`/teacher/viewcontract/${contract.id}`);

    },
    async showContract(req, res, next){
        let contract = await Contract.findById(req.params.id);
        res.render('teacher/showcontract', {contract});
    },
    async editContract(req, res, next){
        let contract = await Contract.findById(req.params.id);
        res.render('teacher/editcontract', {contract});
    },
    async updateContract(req, res, next){
        let contract = await Contract.findById(req.params.id);
        contract.subject = req.body.contract.subject;
        contract.courseDuration = req.body.contract.courseDuration;
        contract.save();
        res.redirect(`/teacher/contract/${contract.id}`);
    },
    async deleteContract(req, res, next){
        let contract = await Contract.findById(req.params.id);
        await contract.deleteOne();
        res.redirect('/teacher/friends');
    }
}
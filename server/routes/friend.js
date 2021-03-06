const express = require('express');
const Friend = require('../models/friend');
const Notification = require('../models/notification');
const Account = require('../models/account');
const router = express.Router();

router.post('/request', (req, res) => {

    Friend.findOne({ username: req.body.sender }, (err, exists) => {
        if (err) throw err;
        if (!exists) {
            let friendList = new Friend({
                username: req.body.sender,
                friends: [{
                    username: req.body.receiver,
                    status: 0
                }]
            });
            friendList.save(err => {
                if (err) throw err;
            });

            let notification = new Notification({
                sender: req.body.sender,
                receiver: req.body.receiver,
                type: 0,
                checked: false
            });

            notification.save(err => {
                if (err) throw err;
            });

            return res.json({ success: true });

        }
        for (let i = 0; i < exists.friends.length; i++) {
            if (exists.friends[i].username === req.body.receiver) {
                return res.status(409).json({
                    error: "already exists request",
                    code: 1
                });
            }
        }

        // Friend.update({ username: req.body.sender}, {$push})
        Friend.updateOne({ username: req.body.sender }, { $push: { friends: { username: req.body.receiver, status: 0 } } }, { upsert: true }, (err, output) => {
            if (err) {
                return res.status(500).json({
                    error: 'database failure',
                    code: 1
                });
            }
            let notification = new Notification({
                sender: req.body.sender,
                receiver: req.body.receiver,
                type: 0,
                checked: false
            });
            notification.save(err => {
                if (err) throw err;
            });

            return res.json({ success: true });
        });
    });
});

router.post('/request/list', (req, res) => {
    Friend.find({ friends: { $elemMatch: { username: req.body.username, status: 0 } } }, (err, friends) => {
        if (err) throw err;

        let query = [];
        let friendList = [];
        for (let i = 0; i < friends.length; i++) {
            query.push(friends[i].username)
        }

        Account.find({ username: { $in: query } }, (err, account) => {
            if (err) throw err;

            for (let i = 0; i < friends.length; i++) {
                for (let j = 0; j < account.length; j++) {
                    if (friends[i].username === account[j].username) {
                        friendList.push({
                            username: friends[i].username,
                            name : account[j].name,
                            photo: account[j].profile.photo,
                        })
                    }
                }
            }
            return res.json({
                success: true,
                list: friendList
            });
        }).sort({ "_id": -1 });
    })
});

router.post('/refuse', (req, res) => {
    Notification.findOne({ receiver: req.body.receiver, sender: req.body.sender, type: 0 }, (err, notice) => {
        Notification.deleteOne({ _id: notice._id }, err => {
            if (err) throw err;

            Friend.updateOne({ username: req.body.sender },
                { $pull: { friends: { username: req.body.receiver } } }, (err, output) => {
                    if (err) {
                        return res.status(500).json({
                            error: 'database failure',
                            code: 1
                        });
                    }
                    return res.json({ success: true });
                })

        })
    })
});
router.post('/allow', (req, res) => {
    Notification.findOne({ receiver: req.body.receiver, sender: req.body.sender, type: 0 }, (err, notice) => {
        Notification.deleteOne({ _id: notice._id }, err => {
            if (err) throw err;

            Friend.updateOne({ username: req.body.sender },
                { $set: { friends: { username: req.body.receiver ,status: 1 } } }, (err, output) => {
                    if (err) {
                        return res.status(500).json({
                            error: 'database failure',
                            code: 1
                        });
                    }

                })
            Friend.findOne({ username: req.body.receiver }, (err, exists) => {
                if (err) throw err;
                if (!exists) {
                    let friendList = new Friend({
                        username: req.body.receiver,
                        friends: [{
                            username: req.body.sender,
                            status: 1
                        }]
                    });

                    friendList.save(err => {
                        if (err) throw err;
                    });
                    return res.json({ success: true });
                }
                Friend.updateOne({ username: req.body.receiver }, { $push: { friends: { username: req.body.sender, status: 1 } } }, { upsert: true }, (err, output) => {
                    if (err) {
                        return res.status(500).json({
                            error: 'database failure',
                            code: 1
                        });
                    }
                    return res.json({ success: true });
                });
            })
        })
    })
});

router.post('/list', (req, res) => {
    Friend.findOne({username:req.body.username},(err, result)=>{
        if(err) throw err;
        if(!result){
            return res.json({
                success: true,
                list: []
            });
        }
        let friends = result.friends;

        let query = [];
        let friendList = [];
        for (let i = 0; i < friends.length; i++) {
            if(friends[i].status===1){
                query.push(friends[i].username)
            }
        }
        Account.find({ username: { $in: query } }, (err, account) => {
            if (err) throw err;

            for (let i = 0; i < friends.length; i++) {
                for (let j = 0; j < account.length; j++) {
                    if (friends[i].username === account[j].username) {
                        friendList.push({
                            username: friends[i].username,
                            name: account[j].name,
                            photo: account[j].profile.photo,
                        })
                    }
                }
            }
            return res.json({
                success: true,
                list: friendList
            });
        })
    })

});

router.post('/delete', (req, res) => {

    Friend.updateOne({ username: req.body.currentUser },
        { $pull: { friends: { username: req.body.friend } } }, (err, output) => {
            if (err) {
                return res.status(500).json({
                    error: 'database failure',
                    code: 1
                });
            }
        })
    Friend.updateOne({ username: req.body.friend },
        { $pull: { friends: { username: req.body.currentUser } } }, (err, output) => {
            if (err) {
                return res.status(500).json({
                    error: 'database failure',
                    code: 1
                });
            }
        })

    return res.json({
        success: true
    })
})
module.exports = router;
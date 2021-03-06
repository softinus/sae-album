import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Profile from '../components/Profile';
import HeaderContainer from './HeaderContainer';
import { logoutRequest, deleteProfileImgRequest, changeProfileImgRequest, getProfileRequest } from '../modules/authentication';
import { addFriendRequest, getFriendsRequest, refuseRequest, allowRequest, getFriendsListRequest, deleteFriendRequest } from '../modules/friend';
import { Modal, ProfileImgChange, Settings } from '../components/index';
import axios, { post } from 'axios';

const ProfileContainer = (props) => {

    const currentPage = props.match.params.id;

    const status = useSelector(state => state.authentication.status, []);
    const profile = useSelector(state => state.authentication.getProfile, []);
    const requestList = useSelector(state => state.friend.getFriends.list, []);
    const friendsList = useSelector(state => state.friend.friendsList.list, []);

    const [modalImgState, setModalImgState] = useState(false);
    const [modalSetState, setModalSetState] = useState(false);
    const [imgPath, setImgPath] = useState('');

    const handleImgChange = e => {
        setImgPath(e.target.value);
        handleSubmit();
    }
    const handleUpload = () => {
        document.getElementById('upload').click();
    }


    const profileChg = useSelector(state => state.authentication.profileChg, []);

    const dispatch = useDispatch();
    const onLogout = () => dispatch(logoutRequest());

    const handleImgModal = () => {
        setModalImgState(!modalImgState);
    }

    const handleSetModal = () => {
        setModalSetState(!modalSetState);
    }

    const handleLogout = () => {
        const Materialize = window.M;
        onLogout().then(
            () => {
                Materialize.toast({html:'Good Bye!'});
                // EMPTIES THE SESSION
                let loginData = {
                    isLoggedIn: false,
                    username: ''
                };
                window.location.href = '/';
                document.cookie = 'key=' + btoa(JSON.stringify(loginData));
            }
        );
    }
    const getProfile = () => {
        return dispatch(getProfileRequest(currentPage));
    }

    const getFriends = () => {
        return dispatch(getFriendsRequest(status.username));
    }
    
    const getFriendsList = () => {
        return dispatch(getFriendsListRequest(status.username));
    }
    useEffect(() => {
        getProfile()
        if (currentPage === status.username) {
            getFriends();
            getFriendsList();
        }
    }, [currentPage]);

    const handleImgDelete = () => {
        const $ = window.$;
        const Materialize = window.M;

        return dispatch(deleteProfileImgRequest(status.currentUser)).then(
            () => {
                if (profileChg.status === "SUCCESS") {
                    Materialize.toast({html:'Success!!'});
                    return true;
                } else {
                    let $toastContent = $('<span style="color: #FFB4BA">Error!</span>');
                    Materialize.toast({html: $toastContent});
                    return false;
                }
            }
        );
    }
    const handleAddFriend = () => {
        if(status.username===''){
            window.location.replace('/');
            return false
        }
        let result = window.confirm(`${currentPage}님에게 친구 요청을 보내겠습니까?`);
        if(result){
            dispatch(addFriendRequest(status.username, currentPage));
            alert('요청을 보냈습니다.');
        }
    }
    const handleSubmit = () => {
        fileUpload(document.forms[0].upload.files[0]);
    }

    const handleAllow = e => {
        let a = e.target.id;
        dispatch(allowRequest(a, status.username))
        getFriends()
        getFriendsList();
    }

    const handleRefuse = e => {
        let a = e.target.id;
        let result = window.confirm(`${a}님의 친구 요청을 거절하겠습니까?`);
        if (result) {
            dispatch(refuseRequest(a, status.username));
            getFriends();
            getFriendsList();
        }
    }
    const friendDelete = e => {
        let a = e.target.id;
        let result = window.confirm(`${a}님을 정말 친구 목록에서 삭제 하시겠습니까?`);
        if(result) {
            alert('삭제되었습니다.');
            dispatch(deleteFriendRequest(status.username, a));
            getFriendsList();
        }
    }
    const movePofilePage = e => {
        let a = e.target.id;
        props.history.push(`/${a}`);
    }

    const fileUpload = (file) => {
        const $ = window.$;
        const Materialize = window.M;

        let email = status.currentUser;
        const url = `http://localhost:4000/api/upload/photo/${email}`;
        const formData = new FormData();
        formData.append('photo', file);
        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            }
        }


        return post(url, formData, config).then(
            (res) => {
                return dispatch(changeProfileImgRequest(email, res.data.path)).then(
                    () => {
                        if (profileChg.status === "SUCCESS") {
                            Materialize.toast({html:'Success!!'});
                            return true;
                        } else {
                            let $toastContent = $('<span style="color: #FFB4BA">Error!</span>');
                            Materialize.toast({html: $toastContent});
                            return false;
                        }
                    }
                )

            }).catch((err) => {
                console.log(err);
            });
    }

    const modalOFF = e => {
        let a = e.target;
        if (a.className === 'modal display-block') {
            setModalImgState(false);
            setModalSetState(false);
        }
    }

    const profileImg =
        <ProfileImgChange
            modalToggle={handleImgModal}
            imgDelete={handleImgDelete}
            uploadFile={handleImgChange}
            upload={handleUpload}
            submit={handleSubmit}
        ></ProfileImgChange>;

    const settings =
        <Settings
            modalToggle={handleSetModal}
            onLogout={handleLogout}
        ></Settings>;



    if (currentPage === status.username) {
        return (
            <HeaderContainer
                props={props}
            >
                <Profile
                    imgModal={handleImgModal}
                    setModal={handleSetModal}
                    userName={status.username}
                    name={status.name}
                    photo={status.profile.photo}
                    bio={status.profile.bio}
                    onLogout={onLogout}
                    mypage={true}
                    requestList={requestList}
                    friendsList={friendsList}
                    movePofilePage={movePofilePage}
                    handleRefuse={handleRefuse}
                    handleAllow={handleAllow}
                    friendDelete={friendDelete}
                />
                <div onClick={modalOFF}>
                    <Modal
                        show={modalImgState}
                    >
                        {profileImg}
                    </Modal>
                    <Modal
                        show={modalSetState}
                    >
                        {settings}
                    </Modal>
                </div>
            </HeaderContainer>
        );
    } else {
        return (
            <HeaderContainer
                props={props}
            >
                <Profile
                    imgModal={handleImgModal}
                    setModal={handleSetModal}
                    userName={profile.username}
                    name={profile.name}
                    photo={profile.photo}
                    bio={profile.bio}
                    onLogout={onLogout}
                    mypage={false}
                    friendsList={friendsList}
                    handleAddFriend={handleAddFriend}
                    friendDelete={friendDelete}
                />
            </HeaderContainer>
        )
    }
};

export default ProfileContainer;
import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import View from '@vkontakte/vkui/dist/components/View/View';
import ScreenSpinner from '@vkontakte/vkui/dist/components/ScreenSpinner/ScreenSpinner';
import '@vkontakte/vkui/dist/vkui.css';

import Home from './panels/Home';
import axios from 'axios';
import getFriends, {backend_url} from "./panels/utils";
import {platform, IOS, ANDROID, ModalCard, FormLayout, ModalRoot, ModalPage} from '@vkontakte/vkui';
import Icon24Done from '@vkontakte/icons/dist/24/done';
import PanelHeaderButton from "@vkontakte/vkui/dist/components/PanelHeaderButton/PanelHeaderButton";
import Icon24Cancel from '@vkontakte/icons/dist/24/cancel';
import ModalPageHeader from "@vkontakte/vkui/dist/components/ModalPageHeader/ModalPageHeader";
import Select from "@vkontakte/vkui/dist/components/Select/Select";
import RangeSlider from "@vkontakte/vkui/dist/components/RangeSlider/RangeSlider";
import Cell from "@vkontakte/vkui/dist/components/Cell/Cell";
import Switch from "@vkontakte/vkui/dist/components/Switch/Switch";
import Checkbox from "@vkontakte/vkui/dist/components/Checkbox/Checkbox";

const osName = platform();
const IS_PLATFORM_IOS = osName === IOS;
const IS_PLATFORM_ANDROID = osName === ANDROID;


function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, '\\$&');
	var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

var _ = require('lodash');

const App = () => {
	const [activePanel, setActivePanel] = useState('home');
	const [fetchedUser, setUser] = useState(null);
	const [accessToken, setAccessToken] = useState('');
	const [popout, setPopout] = useState(<ScreenSpinner size='large' />);
	const [friends, setFriends] = useState([]);
	const [optionsList, setOptionsList] = useState([]);
	const [updateFriends, setUpdateFriends] = useState(0);
	const [filter, setFilter] = useState({'sex': 'a', 'age': {'from': 1, 'to': 100}, 'only_match': false});
	const [hash, setHash] = useState('');
	const [activeModal, setActiveModal] = useState(null);

	const [sex, setSex] = useState(filter['sex']);
	const [ageFrom, setAgeFrom] = useState(filter['age']['from']);
	const [ageTo, setAgeTo] = useState(filter['age']['to']);
	const [onlyMatch, setOnlyMatch] = useState(filter['only_match']);
	const [vkFriends, setVkFriends] = useState([]);
	const [upd, setUpd] = useState(0);
	const [currentUserIndex, setCurrentUserIndex] = useState(0);

	/*
	useEffect(() => {
		bridge.subscribe(({ detail: { type, data }}) => {
			if (type === 'VKWebAppUpdateConfig') {
				const schemeAttribute = document.createAttribute('scheme');
				schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
				document.body.attributes.setNamedItem(schemeAttribute);
			}
		});

		async function fetchData() {
			const user = await bridge.send('VKWebAppGetUserInfo');
			setUser(user);
			var att = await bridge.send("VKWebAppGetAuthToken", {"app_id": 7602116, "scope": "friends"});
			setAccessToken(att.access_token);
			axios.get(backend_url+'auth?at='+att.access_token+'&uid='+user.id).then((data) => {
				setHash(data.data);
			});
			setPopout(null);

			var param = getParameterByName('vk_are_notifications_enabled', null);
			console.log('N:', param);
			if (!param || !parseInt(param)) bridge.send("VKWebAppAllowNotifications").then((data) => {
				console.log(data);
			});

		}
		//fetchData();
	}, []);*/
	/*
	useEffect(() => {
		setSex(filter['sex']);
		setAgeFrom(filter['age']['from']);
		setAgeTo(filter['age']['to']);
		setOnlyMatch(filter['only_match']);
	}, [filter]);

	useEffect(() => {
		setFilter({'sex': sex, 'age': {'from': ageFrom, 'to': ageTo}, 'only_match': onlyMatch});
	}, [sex, ageFrom, ageTo, onlyMatch]);

	useEffect(() => {
		axios.get(backend_url+'get-options').then((data) => {
			setOptionsList(data.data);
		});
	}, []);

	useEffect( () => {
		if (accessToken.length) {
			getFriends(accessToken).then((data) => {
				setVkFriends(data.response.items);

			});
		}

	}, [accessToken]);

	useEffect((fetchedUser, filter, friends, hash) => {
		if (fetchedUser) {
			console.log('upda');
			axios.post(backend_url+'get-friends?uid='+fetchedUser.id+'&hash='+hash, {'friends': vkFriends, 'uid': fetchedUser['id'], 'filter': filter},
			).then((data) => {
				console.log(data.data);
				if (!_.isEqual(data.data, friends)) setFriends(data.data);
			}).catch(() => {
				setUpd(Math.random());
			});
		}
	}, [vkFriends, upd]);

	function timer() {
		setUpd(Math.random());
	}

	useEffect(() => {
		setInterval(timer, 10000);

		return function cleanup() {
			clearInterval(timer);
		};
	}, []);

	const go = e => {
		setActivePanel(e.currentTarget.dataset.to);
	};

	function openModalCard(e) {
		if (e) {
			var ind = e.target.children[0].dataset.ind;
			var uid = e.target.children[0].dataset.id;
			console.log(uid);
			for (var i = 0; i < friends.length; i++) {
				if (friends[i].id === parseInt(uid)) break;
			}
			let friend = friends[i];
			if (!friend) return;
			let o = friend.options;

			setCurrentUserIndex(uid);
			setTimeout(() => {
				for (var i = 0; i < o.length; i++) {
					var oid = o[i]['index'];
					document.getElementById("checkbox-"+(oid-1)).checked = true;
				}
			}, 100);
		} else {
			setCurrentUserIndex(null);
		}
		setActiveModal("friend-options");
	}

	function closeModal() {
		setUpd(Math.random());
		setActiveModal(null);
	}

	function closeModalCard() {
		setActiveModal(null);
	}

	function applyModal() {
		var checked_opts = [];
		for (var i = 0; i < optionsList.length; i++) {
			var el = document.getElementById("checkbox-"+i);
			if (el.checked) {
				checked_opts.push(i+1);
			}
			el.checked = false;
		}

		if (currentUserIndex != null) {
			axios.post(backend_url+'set-options?uid='+fetchedUser.id+'&hash='+hash, {'to': currentUserIndex, 'from': fetchedUser.id, 'options': checked_opts}).then(() => {
				setUpd(Math.random());
			});
		} else {
			var cells = [...document.getElementsByClassName("user-cell")];
			var users = cells.map((x) => parseInt(x.dataset.uid));
			axios.post(backend_url+'set-options?uid='+fetchedUser.id+'&hash='+hash, {'to': users, 'from': fetchedUser.id, 'options': checked_opts}).then(() => {
				setUpd(Math.random());
			});
		}
		closeModal();

	}

	const modal = (<ModalRoot activeModal={activeModal} onClose={closeModal}>
		<ModalPage id="modal" onClose={closeModal} header={<ModalPageHeader
			left={IS_PLATFORM_ANDROID && <PanelHeaderButton onClick={closeModal}><Icon24Cancel /></PanelHeaderButton>}
			right={<PanelHeaderButton onClick={closeModal}>{IS_PLATFORM_IOS ? 'Готово' : <Icon24Done />}</PanelHeaderButton>}
		>
			Фильтры
		</ModalPageHeader>}>
			<FormLayout>
				<Select top="Пол" value={sex} onChange={(e) => {
					setSex(e.target.value);
				}}>
					<option value="a">Любой</option>
					<option value="m">Мужской</option>
					<option value="f">Женский</option>
				</Select>
				<RangeSlider
					top="Возраст"
					min={1}
					max={100}
					step={1}
					defaultValue={[ageFrom, ageTo]}
					onChange={(e) => {
						setAgeFrom(e[0]);
						setAgeTo(e[1]);
					}}
					bottom={"От " + ageFrom + " до " + ageTo}
				/>
				<Cell asideContent={<Switch id="only-match" checked={onlyMatch} onChange={(e) => {
					setOnlyMatch(e.target.checked);
				}} />}>
					Только совпадения
				</Cell>
			</FormLayout>
		</ModalPage>

		<ModalCard
			id="friend-options"
			className="tst"
			header="Выберите свойства"
			onClose={closeModalCard}
			actions={[{title: 'Применить', mode: 'primary', action: applyModal}]}
		>
			<FormLayout>
				{(() => {
					let a = [];
					for (var i = 0; i < optionsList.length; i++) {
						a.push(<Checkbox id={'checkbox-'+i} key={'checkbox-'+i}>{optionsList[i]}</Checkbox>);
					}
					return a;
				})()}
			</FormLayout>
		</ModalCard>
	</ModalRoot>);*/
	return <h1>bbbbbb</h1>;
	/*return (
		<View activePanel={activePanel} popout={popout} modal={modal}>
			<Home id='home' fetchedUser={fetchedUser}
				    hash={hash}  optionsList={optionsList} setActiveModal={setActiveModal} friends={friends} setUpd={setUpd} openModalCard={openModalCard} setFilter={setFilter} filter={filter}  />
			</View>
	);*/
};

export default App;


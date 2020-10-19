import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';
import Button from '@vkontakte/vkui/dist/components/Button/Button';
import Group from '@vkontakte/vkui/dist/components/Group/Group';
import Cell from '@vkontakte/vkui/dist/components/Cell/Cell';
import Div from '@vkontakte/vkui/dist/components/Div/Div';
import Avatar from '@vkontakte/vkui/dist/components/Avatar/Avatar';
import Header from '@vkontakte/vkui/dist/components/Header/Header';
import Select from '@vkontakte/vkui/dist/components/Select/Select';
import RichCell from '@vkontakte/vkui/dist/components/RichCell/RichCell';
import RangeSlider from "@vkontakte/vkui/dist/components/RangeSlider/RangeSlider";
import {FormLayout, FormLayoutGroup, Input, ModalCard, ModalRoot, ModalPage} from '@vkontakte/vkui';

import './utils';
import './Home.css';
//import './Friends.css';
import getFriends, {backend_url} from "./utils";
import Checkbox from "@vkontakte/vkui/dist/components/Checkbox/Checkbox";
import Switch from "@vkontakte/vkui/dist/components/Switch/Switch";
import Icon24Filter from "@vkontakte/icons/dist/24/filter";
import Search from "@vkontakte/vkui/dist/components/Search/Search";
import List from "@vkontakte/vkui/dist/components/List/List";
import axios from 'axios';
import FireIcon from '../img/icon.svg';

var _ = require('lodash');

const Home = ({ id, fetchedUser, hash, optionsList, setActiveModal, friends, setUpd, openModalCard, setFilter, filter }) => {
	const [searchValue, setSearchValue] = useState('');

	var opts = optionsList;

	function getText(uid) {
		try {
			for (var i = 0; i < friends.length; i++) {
				if (friends[i].id === uid) break;
			}
			if (!friends[i].options.length) {
				return 'Нет свойств';
			} else {
				let o = [];
				for (var j = 0; j < friends[i].options.length; j++) {
					var op = friends[i].options[j];
					o.push(opts[op['index']-1])

				}
				return o.join(', ');
			}
		} catch (e) {}

	}

	function getCaption(uid) {
		try {
			for (var i = 0; i < friends.length; i++) {
				if (friends[i].id === uid) break;
			}
			if (!friends[i].options.length) {
				return '';
			} else {
				let o = [];
				for (var j = 0; j < friends[i].options.length; j++) {
					var op = friends[i].options[j];
					if (op.show) o.push(opts[op['index']-1]);

				}
				if (o.length) return 'Совпало: ' + o.join(', ');
				else return '';
			}
		} catch (e) {}
	}

	function drawCircle(draw) {
		var el = document.getElementById("header-circle");
		if (el) el.remove();
		if (draw) {
			el = document.createElement("img");
			el.id = 'header-circle';
			el.src = FireIcon;
			el.onclick = function () {
				if (!filter['only_match']) {
					setFilter({'sex': 0, 'age': {'from': 1, 'to': 100}, 'only_match': true});
				} else {
					setFilter({'sex': 0, 'age': {'from': 1, 'to': 100}, 'only_match': false});
				}
				setUpd(Math.random());
			};
			var parent = document.getElementsByClassName("PanelHeader__content")[1];
			if (!parent)  parent = document.getElementsByClassName("PanelHeader__content")[0];
			parent.appendChild(el);
			var x = el.getBoundingClientRect();
			console.log(x);
			return;
			if (x.width !== x.height) {
				for (var i = 2; i < 30; i++) {
					el.style.width = i+'px';
					x = el.getBoundingClientRect();
					if (x.width === x.height) break;
				}
			}
		}

	}

	function drawFriends() {
		var result = [];
		var draw_circle = false;

		var fr = friends;
		if (searchValue) {
			var search = searchValue.toLowerCase();
			fr = friends.filter((friend) => (friend.first_name + " " + friend.last_name).toLowerCase().indexOf(search) > -1);
		}


		for (var i = 0; i < fr.length; i++) {
			var friend = fr[i];
			if (!friend.options) return ;
			var inc = friend.options.map((x) => {
				if (x.show && !x.checked) return 1;
				else return 0;
			}).includes(1);
			if (inc) draw_circle = true;
			result.push(<RichCell
				before={<Avatar data-id={i} size={48} src={friend.photo_100} className={inc ? 'new-match' : 'no-new-match'} />}
				multiline
				className="user-cell"
				data-uid={friend.id}
				caption={getCaption(friend.id)}
				actions={
					<React.Fragment>
						<Button mode="secondary" onClick={openModalCard} data-ind={i} data-id={friend.id}>Изменить<span data-ind={i} data-id={friend.id}></span></Button>
					</React.Fragment>
				}

				text={getText(friend.id)}
				onClick={(e) => {
					console.log(e);
					if (e.target.dataset && e.target.dataset.id) {
						var id = e.target.dataset.id;
						axios.get(backend_url+'check?uid='+fetchedUser.id+'&check_id='+fr[id].id+'&uid='+fetchedUser.id+'&hash='+hash).then((data) => {
							setUpd(Math.random());
						});
					}

				}}
			>
				{friend.first_name + " " + friend.last_name}
			</RichCell>);
		}
		drawCircle(draw_circle);
		return result;
	}

	function openModal() {
		setActiveModal('modal');
	}

	function setSearch(e) {
		setSearchValue(e.target.value);
	}


	return (<Panel id={id}>
			<PanelHeader left={
				<Button className="header-button" mode="tertiary" onClick={() => {
					openModalCard(null);
				}}>Я всех люблю</Button>
			}>Между нами</PanelHeader>
			<Search
				value={searchValue}
				onChange={setSearch}
				icon={<Icon24Filter />}
				onIconClick={openModal}
			/>
			<Div className="friend-list">
				<List>
					{drawFriends()}
				</List>

			</Div>


		</Panel>
	);
};

Home.propTypes = {
	id: PropTypes.string.isRequired,
	fetchedUser: PropTypes.shape({
		photo_200: PropTypes.string,
		first_name: PropTypes.string,
		last_name: PropTypes.string,
		city: PropTypes.shape({
			title: PropTypes.string,
		}),
	}),
};

export default Home;

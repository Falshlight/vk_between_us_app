import bridge from '@vkontakte/vk-bridge';

const backend_url = 'https://flashlightservice.ml:5000/';

async function getFriends(at) {
    // filter: {sex: 0, age: 0}
    var res = await bridge.send("VKWebAppCallAPIMethod", {"method": "friends.get",
        "request_id": "32test", "params": {"v":"5.124", "access_token": at, "count": 10000, "fields": "first_name,last_name,sex,bdate,photo_100", "order": "name"}});

    return res;
}

export default getFriends;
export {backend_url};
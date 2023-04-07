function getProductInPage(e) {
    history.replaceState(null, '', location.pathname + replaceQueryParam('proInPage', e.value, window.location.search));
    BindData();
}

function searchProduct() {
    var kw = document.getElementById('search').value;
    window.location.replace("shop?keyword=" + kw);
}

function replaceQueryParam(param, newval, search) {
    var regex = new RegExp("([?;&])" + param + "[^&;]*[;&]?");
    var query = search.replace(regex, "$1").replace(/&$/, '');

    return (query.length > 2 ? query + "&" : "?") + (newval ? param + "=" + newval : '');
}

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function getProductByPage(e) {
    history.replaceState(null, '', location.pathname + replaceQueryParam('page', e.value, window.location.search));
    BindData();
}
var _data;
function BindData() {
    var page = getParameterByName('page');
    var view = getParameterByName('proInPage');
    var type = getParameterByName('type');
    var keyword = getParameterByName('keyword');
    if (_data == undefined) {

        var request = new XMLHttpRequest();
        var link = "getData";
        if (type != undefined && type.length > 0)
            link += ("?type=" + type);
        if (keyword != undefined && keyword.length > 0)
            link += ("?keyword=" + keyword);

        request.open("GET", link);
        request.onreadystatechange = function () {
            // Kiểm tra xem yêu cầu đã hoàn thành và thành công chưa
            if (this.readyState === 4 && this.status === 200) {
                var data = JSON.parse(this.responseText);
                _data = data;
                BindDataHtml(page, view);
            }
        };
        request.send();
    } else
        BindDataHtml(page, view)

}

function BindDataHtml(page, view) {
    var _view = 10, _page = 1, _keyword = '';
    if (view != undefined && view.length > 0)
        _view = view
    if (page != undefined && page.length > 0)
        _page = page
    var tempHtml = $('#my-template').html();
    var temppagingHtml = $('#my-paging-template').html();
    var html = '';

    var totalRow = _data.length;
    var maxPage = (totalRow / _view) + 1;
    for (var j = 1; j <= maxPage; j++) {
        let rendered = Mustache.render(temppagingHtml, { page: j });
        console.log(rendered)
        html += rendered;
    }
    document.getElementById("pagingData").innerHTML = html;
    html = '';
    for (var i = 0; i < _data.length; i++) {
        if (i >= ((_page - 1) * _view) && i < ((_page) * _view)) {

            let rendered = Mustache.render(tempHtml, _data[i]);
            html += rendered;
        }
    }
    document.getElementById("containProduct").innerHTML = html;
}

function BindHomeData() {

    var request = new XMLHttpRequest();
    var link = "getHomeData";

    request.open("GET", link);
    request.onreadystatechange = function () {
        // Kiểm tra xem yêu cầu đã hoàn thành và thành công chưa
        if (this.readyState === 4 && this.status === 200) {
            var data = JSON.parse(this.responseText);

            var tempHtml = $('#my-template').html();
            var html = '';
            for (var i = 0; i < data.length; i++) {
                let rendered = Mustache.render(tempHtml, data[i]);
                html += rendered;
            }
            document.getElementById("proInHome").innerHTML = html;
        }
    };
    request.send();

}

function addToCart(e) {
    var qty = document.getElementById('proqty').value;
    var price = document.getElementById('proPrice').value;
    var cart = [];

    if (sessionStorage.getItem("myCart") != null && sessionStorage.getItem("myCart").length > 0)
        cart = JSON.parse(sessionStorage.getItem("myCart"));
    var isHas = false;
    cart.forEach(function (element, index) {
        if (element.ID == e.value) {
            isHas = true;
            element.num = parseInt(element.num) + parseInt(qty);
            cart[index] = element;
        }
    });
    if (!isHas)
        cart.push({ ID: e.value, num: qty, price: price })
    sessionStorage.setItem("myCart", JSON.stringify(cart));
    window.location.replace("cart");
}

function countItemInCart() {
    var cart = [];
    if (sessionStorage.getItem("myCart") != null && sessionStorage.getItem("myCart").length > 0)
        cart = JSON.parse(sessionStorage.getItem("myCart"));

}

function showCartItem() {
    document.getElementById("cartBody").innerHTML='';
    var request = new XMLHttpRequest();

    var cart = [];
    if (sessionStorage.getItem("myCart") != null && sessionStorage.getItem("myCart").length > 0)
        cart = JSON.parse(sessionStorage.getItem("myCart"));
    if (cart.length > 0) {
        var ids = '';
        cart.forEach(function (element, index) {
            if (ids.length > 0) ids += ',';
            ids += element.ID;
        });

        var link = "getDataInCart?id=" + ids;

        request.open("GET", link);
        request.onreadystatechange = function () {
            // Kiểm tra xem yêu cầu đã hoàn thành và thành công chưa
            if (this.readyState === 4 && this.status === 200) {
                var data = JSON.parse(this.responseText);

                var tempHtml = $('#my-template').html();
                var html = '';
                for (var i = 0; i < data.length; i++) {
                    cart.forEach(function (element, index) {
                        if (element.ID == data[i].ID) {
                            data[i].Qty = element.num;
                        }
                    });
                    console.log(data[i])
                    let rendered = Mustache.render(tempHtml, data[i]);
                    html += rendered;
                }
                document.getElementById("cartBody").innerHTML = html;
            }
        };
        request.send();
    }
}

function updateCart(e) {
    var qty = e.value;
    var id = $(e).attr("data-id")
    var cart = [];

    if (sessionStorage.getItem("myCart") != null && sessionStorage.getItem("myCart").length > 0)
        cart = JSON.parse(sessionStorage.getItem("myCart"));
    var isHas = false;
    cart.forEach(function (element, index) {
        if (element.ID == id) {
            isHas = true;
            element.num = qty;
            cart[index] = element;
        }
    });
    if (!isHas)
        cart.push({ ID: e.value, num: qty, price: price })
    sessionStorage.setItem("myCart", JSON.stringify(cart));
    calculatePrice();
}
function deleteItem(e) {
    var cart = [];
    var id = e.value

    if (sessionStorage.getItem("myCart") != null && sessionStorage.getItem("myCart").length > 0)
        cart = JSON.parse(sessionStorage.getItem("myCart"));
    var indexDel = -1;
    cart.forEach(function (element, index) {
        if (element.ID == id) {
            indexDel = index;
        }
    });
    console.log(id, indexDel)
    if (indexDel >= 0)
        cart.splice(indexDel, 1);
    sessionStorage.setItem("myCart", JSON.stringify(cart));
    showCartItem()
    calculatePrice();
}

function calculatePrice() {
    var cart = [];
    if (sessionStorage.getItem("myCart") != null && sessionStorage.getItem("myCart").length > 0)
        cart = JSON.parse(sessionStorage.getItem("myCart"));
    var totalPrice = 0;
    cart.forEach(function (element, index) {
        totalPrice += parseInt(element.num) * parseInt(element.price);

    });
    $('#spanSubTotal').text('$ ' + totalPrice)
    $('#spanTotal').text('$ ' + totalPrice)
}



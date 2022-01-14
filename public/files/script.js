let util = new function () {

    this.ajax = (params, callback) => {
        let url = "";
        if (params.path !== undefined) {
            url = params.path;
            delete params.path;
        }
        fetch("/student" + url, params).then(data => data.json()).then(callback)
    }

    this.parse = (tpl, obj) => {
        let str = tpl;
        for (let k in obj) {
            str = str.replaceAll("{" + k + "}", obj[k]);
        }
        return str;
    };

    this.id = el => document.getElementById(el);
    this.q = el => document.querySelectorAll(el);
    this.listen = (el, type, callback) => el.addEventListener(type, callback);
}


let data = (new function () {

    let inc = 0;
    const arr = {};

    this.init = (callback) => {
        util.ajax({method: "GET"}, data => {
            data.map(std => {
                arr[std.Id] = std;
                inc = std.Id;
            });
            inc++;
            if (typeof callback == 'function') callback();
        })
    }

    this.create = obj => {
        obj.Id = inc++;
        arr[obj.Id] = obj;
        util.ajax({method: "POST", body: JSON.stringify(obj)});
        return obj;
    }

    this.getAll = () => {
        return Object.values(arr);
    }

    this.get = id => arr[id];

    this.update = obj => {
        arr[obj.Id] = obj;
        util.ajax({method: "PUT", body: JSON.stringify(obj)});
        return obj;
    }

    this.delete = id => {
        delete arr[id];
        util.ajax({method: "DELETE", path: "/" + id});
    }
});


const student = new function () {

    this.submit = () => {
        const st = {
            name: util.id("name").value,
            date: util.id("date").value,
            email: util.id("email").value,
            id: util.id("id").value
        };

        if (util.id("Id").value === "-1") data.create(st)
        else {
            st.Id = util.id("Id").value;
            data.update(st);
        }

        this.render();
        util.id("overlay").style.display = "none"
        util.id("addWindow").style.display = "none"
    }

    this.remove = () => {
        data.delete(activeStudent);
        activeStudent = null;

        this.render()
        util.id("overlay").style.display = "none"
        util.id("deleteWindow").style.display = "none"
    }

    const init = () => {

        data.init(() => {
            this.render();
        });

        util.q("button.addButton").forEach(el => {
            util.listen(el, "click", add);
        });

        util.q(".close").forEach(el => {
            util.listen(el, "click", () => {
                util.id("overlay").style.display = "none";
                util.id("deleteWindow").style.display = "none"
                util.id("addWindow").style.display = "none"
            });
        });

        util.q(".hideButton").forEach(el => {
            util.listen(el, "click", () => {
                util.id("overlay").style.display = "none";
                util.id("deleteWindow").style.display = "none"
                util.id("addWindow").style.display = "none"
            });
        });

        util.q(".submit").forEach(el => {
            util.listen(el, "click", () => {
                this[el.dataset["func"]]();
            });
        });
    };

    const add = () => {
        util.q("#addWindow form")[0].reset();
        util.id("Id").value = "-1";
        util.id("overlay").style.display = "block";
        util.id("addWindow").style.display = "block";
    };

    const edit = el => {
        util.q("#addWindow form")[0].reset();
        const st = data.get(el.dataset["id"]);
        for (let k in st) util.id(k).value = st[k];
        util.id("overlay").style.display = "block";
        util.id("addWindow").style.display = "block";
    };

    let activeStudent = null;
    const rm = el => {
        util.id("overlay").style.display = "block";
        util.id("deleteWindow").style.display = "block";
        activeStudent = el.dataset["id"];
    };

    const addListener = () => {
        util.q("button.editButton").forEach(el => {
            util.listen(el, "click", () => edit(el));
        });

        util.q("button.deleteButton").forEach(el => {
            util.listen(el, "click", () => rm(el));
        });
    };

    this.render = () => {
        util.id("table").innerHTML = data
            .getAll()
            .map(el => util.parse(tpl, el)).join("");
        addListener();
    };

    const tpl = `
        <tr>
            <td>{name}</td>
            <td>{date}</td>
            <td>{email}</td>
            <td>{id}</td>
            <td class="invisible">
                <button type="button" class="editButton"   data-id="{Id}">Изменить</button>
                <button type="button" class="deleteButton" data-id="{Id}">Удалить</button>
            </td>
        </tr>`;
    window.addEventListener("load", init);
}
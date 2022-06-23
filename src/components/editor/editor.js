import "../../helpers/iframeLoader.js";
import axios from 'axios';
import React, {Component} from 'react';
import DomHelper from "../../helpers/dom-helper";


export  default class Editor extends Component{
    constructor() {
        super();
        this.currentPage = "index.html";

        this.state = {
            pageList: [],
            newPageName: ""
        }
        this.createNewPage = this.createNewPage.bind(this);
    }

    componentDidMount() {
        this.init(this.currentPage);
    }

    init(page) {
        this.iframe = document.querySelector('iframe');
        this.open(page);
        this.loadPageList();
    }

    /* */
    open(page) {
        this.currentPage = page;             /*select the page you want to open, and reset the caching */

        axios
            .get(`../${page}?rnd=${Math.random()}`)
            .then(res => DomHelper.parseStrToDOM(res.data))
            .then(DomHelper.wrapTextNodes)           /*clean copy */
            .then(dom => {                                 /*save to clean copy */
                this.virtualDOM = dom;
                return dom;
            })
            .then(DomHelper.serializeDOMToString)
            .then(html => axios.post("./api/saveTempPage.php", {html}))  /*post str to server */
            .then(() => this.iframe.load("../temp.html"))
            .then(() => this.enableEditing())            /*enableEditing on site */

    }

    save() {
        const newDom = this.virtualDOM.cloneNode(this.virtualDOM);
        DomHelper.unwrapTextNodes(newDom);
        const html = DomHelper.serializeDOMToString(newDom);
        axios
            .post("./api/savePage.php", {pageName: this.currentPage,  html })

    }

    enableEditing() {
        this.iframe.contentDocument.body.querySelectorAll("text-editor").forEach(element => {
             element.contentEditable = "true";
             element.addEventListener("input", () => {
                 this.onTextEdit(element);
             })
        });

    }

    onTextEdit(element) {
        const id = element.getAttribute("nodeid");
        this.virtualDOM.body.querySelector(`[nodeid="${id}"]`).innerHTML = element.innerHTML;
    }

    loadPageList() {
        axios
            .get("./api")
            .then(res => this.setState({pageList: res.data}))
    }

    createNewPage() {
        axios
            .post("./api/createNewPage.php", {"name": this.state.newPageName})
            .then(this.loadPageList())
            .catch(() => alert("Страница уже существует!"));
    }

    deletePage(page) {
        axios
            .post("./api/deletePage.php", {"name": page})
            .then(this.loadPageList())
            .catch(() => alert("Страницы не существует!"));
    }


    render() {
        // const {pageList} = this.state;
        // const pages = pageList.map((page, i) => {
        //     return (
        //         <h1 key={i}>{page}
        //             <a href="#"
        //             onClick={()=> this.deletePage(page)}>(x)</a>
        //
        //         </h1>
        //     )
        // });
        return (
            <>
                <button onClick={() => this.save()}>Click</button>
                <iframe src={this.currentPage} frameBorder="0"></iframe>
            </>
            // <>
            //     <input
            //         onChange={(e) => {this.setState({newPageName: e.target.value})}}
            //         type="text"/>
            //     <button onClick={this.createNewPage}>Создать страницу</button>
            //     {pages}
            // </>
        )
    }

}
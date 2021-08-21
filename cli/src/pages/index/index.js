

const IndexPage = new Page({
    el: 'index_page',
    data: {
        name: 'indexName',
        user: {
            name: 'sg',
            age: '23'
        },
        params:{
            'article_offset':1,
            'question_offset':1,
            'page_size':10
        }
    },
    checkEs6() {
        const foo = () => {
            this.data = Object.assign(this.data, {
                age: '18'
            })
        }
        foo()
        var values = Object.values(this.data)
        $('.es6 span').html(values)
    },
    click() {
        console.log('onclick')
    },
    event() {
        // const self = this
    },
    init() {
        this.checkEs6()
        window.$ajax.post("/api/content/mix/list",this.data.params).then((res)=>{
            console.log(res)
        })
    }
})
console.dir(IndexPage)

Vue.component("data-table", {
    props: {
        columns: {
            type: [Array, Object]
        },
        urlApi: {
            type: String
        },
        actions: {
            type: [Array, Object]
        },
        filtered: {
            type: Boolean,
            default: true
        },
        checkable: {
            type: Boolean,
            default: true
        },
        paginator: {
            type: Object,
            default: function () {
                return {
                    perPage: 15
                };
            }
        },
        serverSide: {
            type: Boolean,
            default: false
        }
    },
    template: `
        <div class="card">
            <div class="card-header bg-warning">
                <div class="row">
                    <div class="col-md-6">
                        <button type="button" class="btn btn-secondary">
                            <i class="fa fa-plus"></i>
                        </button>
                    </div>
                    <div class="col-md-6 text-right">
                        <div class="btn-group">
                            <button type="button" class="btn btn-dark" :style="[filtered ? {'color':'#bbb'} : {'color':'#000'}]" @click="withFiltered()">
                                <i class="fa fa-filter"></i>
                            
                            </button>
                            <button type="button" class="btn btn-dark dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="fa fa-cogs"></i>
                            </button>
                            <div class="dropdown-menu dropdown-menu-right">
                                <div class="col-6">
                                    <div class="form-check form-check-inline" v-for="column, index in table.columns">
                                        <input class="form-check-input" type="checkbox" :checked="isVisibleColumn(column)" @click="showColumn(column)">
                                        <label class="form-check-label">{{column.title}}</label>                                 
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-body" style="padding:0 !important">

      <table class="table table-striped table-hover table-dark">
        <thead>
            <tr>
                <th v-show="checkable">
                    <input type="checkbox">
                </th>            
                <th v-for="column in table.columns" v-if="column.visible">{{column.title}}<i v-if="column.sortable" :ref="'sort_'+column.field" @click="sortColumn(column)" class="fa fa-sort" style="float:right"></i></th>
                <th v-show="actions.length">Ações</th>
            </tr>
            <tr v-show="filtered">
                <td v-show="checkable">
                    
                </td>
                <td v-for="column, index in table.columns" v-if="column.visible">
                    <input v-if="!column.selectbox" class="form-control" type="text" :name="column.field" v-model="filter.searchValues[index]">
                    <select v-else class="form-control select2" :name="column.field" v-model="filter.searchValues[index]">
                        <option v-for="option in column.selectbox" :name="column.field" :value="option.id">{{option.text}}</option>
                    </select>
                </td>
                <td v-show="actions.length">
                    <div class="group-btn">
                        <button class="btn btn-dark">
                            <i class="fa fa-search"></i>
                        </button>

                        <button class="btn btn-dark" type="button" @click.prevent="getData(table.page)">
                            <i class="fa fa-sync"></i>
                        </button>
                    </div>
                </td>
            </tr>
        </thead>
        
        <tbody>
            <tr v-if="!displayedData.length">
                <td colspan="100%">Nenhum registro encontrado.</td>
            </tr>
            
            <tr v-else v-for="row in displayedData">
                <td v-show="checkable">
                    <input type="checkbox" name="selection[]">
                </td>
                <td v-for="column in table.columns" v-if="column.visible">{{row[column.field]}}</td>
                <td v-show="actions.length">
                    <div class="btn-group">
                    <button class="btn" :class="action.class" v-for="action in actions">
                        <i v-show="action.icon" :class="action.icon"></i>
                        {{action.label}}
                    </button>
                    </div>
                </td>
            </tr>
        </tbody>
        
        <tfoot>
            <tr>
                <td colspan="100%">
                    <div class="row">
                        <div class="col-md-12">
                            total de <b>{{table.total}}</b> registros, 
                            <select v-model="table.perPage">
                                <option value="10" selected>10</option>
                                <option value="30">30</option>
                                <option value="60">60</option>
                                <option value="100">100</option>
                            </select>
                            por página.
                        </div>
                        <div class="col-md-12 text-right">
                            <nav aria-label="Pagination">
                                <ul class="pagination justify-content-end">

                                    <li class="page-item" v-show="table.page != 1" @click="setPage(1)">
                                        <a class="page-link" href="#" tabindex="-1" aria-disabled="true">
                                            <i class="fa fa-angle-double-left"></i>
                                        </a>
                                    </li>

                                    <li class="page-item" :class="{disabled:this.table.page <= 1}" @click="setPrevPage()">
                                        <a class="page-link" href="#" tabindex="-1" aria-disabled="true">
                                            <i class="fa fa-angle-left"></i>
                                        </a>
                                    </li>
                                    
                                    <li class="page-item" :class="{active: pageNumber == table.page}" v-for="pageNumber in displayedPaginate" @click="setPage(pageNumber)">
                                        <a class="page-link" href="#"> {{pageNumber}}</a>
                                    </li>

                                    <li class="page-item"  :class="{disabled:this.table.page >= this.table.maxPage}" @click="setNextPage()">
                                        <a class="page-link" href="#">
                                            <i class="fa fa-angle-right"></i>
                                        </a>
                                    </li>

                                    <li class="page-item" v-show="table.page != table.maxPage" @click="setPage(table.maxPage)">
                                        <a class="page-link" href="#" tabindex="-1" aria-disabled="true">
                                            <i class="fa fa-angle-double-right"></i>
                                        </a>
                                    </li>                                    
                                </ul>
                            </nav>
                        </div>
                    </div>

                </td>
            </tr>
        </tfoot>
      </table>
      </div>
      </div>
    `,
    data: function () {
        return {
            table: {
                columns: this.columns,
                data: this.urlApi,
                actions: this.actions,
                total: 0,
                page: 1,
                firstPage: 0,
                lastPage: 9,
                perPage: 10,
                maxPage: 0,
                pages: []
            },
            filter: {
                searchColumns: [],
                searchValues: [],
                data: [],
                checkedColumns: []
            }
        };
    },
    watch: {
        "table.perPage": function (){
            if (this.serverSide)
                this.getData(this.table.page);
        },
        "table.data": function () {
            this.setPages();
        },
        "filter.data": function () {
            this.setPages();
        },

        "filter.searchValues": function () {
            let search = this.mergeArrayByIndex(
                this.filter.searchColumns,
                this.filter.searchValues
            );

            columns = Object.keys(search).filter(field => search[field]);
            this.table.page = 1
            if (this.serverSide)
                this.getData(this.table.page);
            else
                this.filter.data = this.table.data.filter(data => columns.every(field => data[field].toString().toLowerCase().indexOf(search[field]) !== -1));
        },

        "columns": function (options) {
            if (options.visible == undefined) {
                options.visible = true;
            }
        }
    },
    computed: {
        displayedData() {
            if(this.serverSide){
                this.filter.data = this.table.data;
                return this.paginate(this.table.data);
            }else{
                this.filter.data = this.filter.data.length ? this.filter.data : this.table.data;
                return this.paginate(this.filter.data);
            }
        },
        displayedPaginate(){
            let page = this.table.page //Pagina Atual
            let perPage = this.table.perPage //Por Pagina
            let d = page % perPage
            console.log(d)
            if(d > 5){
                this.table.firstPage++;
                this.table.lastPage++;
            }
            return this.table.pages.slice(this.table.firstPage,this.table.lastPage)
        }
    },
    methods: {
        getData(page) {

            if(this.serverSide){

                axios
                .post(this.urlApi,{
                    initial: page ,
                    lengthPage: this.table.perPage,
                    columns: this.table.columns,
                    filter: [this.filter.searchColumns,this.filter.searchValues]
                })
                .then((resp) => {
                    this.filter.data = this.table.data = resp.data.data;
                    if(this.serverSide){
                        this.table.total = parseInt(resp.data.total);
                        this.table.page = page
                    }else
                        this.table.total = this.table.data.length;
                })
                .catch(error => {});
            }else{

                axios
                .get(this.table.data)
                .then(resp => {
                    this.filter.data = this.table.data = resp.data;
                    this.table.total = this.table.data.length;
                })
                .catch(error => {});                
            }
            
            this.filter.searchColumns = [];
            this.table.columns.filter(data => {
                this.filter.searchColumns.push(data.field);
                if (data.selectbox != undefined) {
                    switch (typeof data.selectbox) {
                        case "string":
                            axios.get(data.selectbox).then(resp => {
                                data.selectbox = resp.data;
                            });
                            break;
                    }
                }
            });
        },
        setPages() {

            this.table.pages = [];

            if (this.serverSide)
                this.table.maxPage = Math.ceil(this.table.total / this.table.perPage)
            else
                this.table.maxPage = Math.ceil(this.filter.data.length / this.table.perPage)
            
            for (let index = 1; index <= this.table.maxPage; index++) {
                this.table.pages.push(index);
            }                
        },
        paginate(data) {
            let page = this.table.page;
            let perPage = this.table.perPage;
            let from = page * perPage - perPage;
            let to = page * perPage;
            if (this.serverSide)
                return data
            else
                return data.slice(from, to);
        },
        setPrevPage() {
            if (this.table.page - this.table.perPage <= 1) {
                this.table.page = 1;
            } else {
                this.table.page -= this.table.perPage;
            }
            if(this.serverSide)
                this.getData(this.table.page)            
        },
        setNextPage() {
            if (this.table.page + this.table.perPage >= this.table.maxPage) {
                this.table.page = this.table.maxPage;
            } else {
                this.table.page += this.table.perPage;
            }
            if(this.serverSide)
                this.getData(this.table.page)
        },
        setPage(page) {
            if(this.serverSide)
                this.getData(page)
            else
                this.table.page = page;
        },
        mergeArrayByIndex(array1, array2) {
            var obj = {};
            array1.map((e, i) => {
                if (array2[i] == undefined) array2[i] = "";
                obj[e] = array2[i];
            });
            return obj;
        },
        compareValues(key, order = 'asc') {
            return function (a, b) {
                if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
                    return 0;
                }

                const varA = (typeof a[key] === 'string') ? a[key].toUpperCase() : a[key];
                const varB = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];

                let comparison = 0;

                if (varA > varB) {
                    comparison = 1;
                } else if (varA < varB) {
                    comparison = -1;
                }

                return (order == 'desc') ? (comparison * -1) : comparison
            };
        },
        showColumn(obj) {
            obj.visible = !obj.visible;
        },
        isVisibleColumn(obj) {
            return obj.visible;
        },
        withFiltered() {
            this.filtered = !this.filtered;
        },
        sortColumn(column, dir = 'asc') {

            let className = this.$refs['sort_' + column.field][0].className;

            /**
             * SE NAO TIVER NADA -> FAZER ORDEM CRESCENTE
             * SE TIVER ORDEM CRESCENTE  -> FAZER ORDEM DESCRECENTE
             * SE TIVER EM ORDEM DESCRECENTE -> NAO FAZER NADA
             */

            if (className.toString().toLowerCase().indexOf("sort_asc") == -1 && className.toString().toLowerCase().indexOf("sort_desc") == -1) {
                dir = 'asc';
                this.$refs['sort_' + column.field][0].className = 'sort_asc fa fa-sort-down';
                column.ordering = 'asc';
            } else if (className.toString().toLowerCase().indexOf("sort_asc") !== -1) {
                dir = 'desc';
                this.$refs['sort_' + column.field][0].className = 'sort_desc fa fa-sort-up';
                column.ordering = 'desc';
            }else if (className.toString().toLowerCase().indexOf("sort_desc") !== -1){
                dir = 'asc';
                this.$refs['sort_' + column.field][0].className = 'fa fa-sort';
                column.ordering = 'not';
            }

            this.filter.data.sort(this.compareValues(column.field, dir))
        },
    },
    beforeUpdate() {
        console.log("atualizando")
    },
    updated() {
        console.log("atualizado!")
    },

    mounted() {
        this.getData(this.table.page);
    }
});
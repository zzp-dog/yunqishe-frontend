/*
* @Author: your name
* @Date: 2020-03-08 21:12:21
* @LastEditTime: 2020-03-16 14:58:12
* @LastEditors: Please set LastEditors
* @Description: In User Settings Edit
* @FilePath: \nuxt-ssr\pages\admin\circle-and-circle\list\list.ts
*/
import Component from 'vue-class-component';
import strCut from '~/core/modules/filters/strCut';
import TableComponent from '@/core/modules/components/commons/table/table';
import BaseComponent from '~/core/base-component';
import ButtonComponent from '@/core/modules/components/commons/form/button/button';
import SelectComponent from '@/core/modules/components/commons/form/select/select.vue';
import WindowComponent from '@/core/modules/components/commons/biz-alert/_window/window.vue';
import PageBarComponent from '@/core/modules/components/commons/page-bar/page-bar.vue';
import EditorComponent from '@/core/modules/components/commons/editor/editor.vue';
import { Ref } from 'vue-property-decorator';
@Component({
    layout: 'admin',
    filters: {
        strCut
    },
    components: {
        TableComponent,
        WindowComponent,
        SelectComponent,
        ButtonComponent,
        EditorComponent,
        PageBarComponent
    }
})
export default class ListComponent extends BaseComponent {
    /** 是否可见 */
    visibleList: any[] = [
        {id: 0, description: '不可见'},
        {id: 1, description: '可见'},
    ];
    /** 默认显示所有可见和非可见 */
    searchVisible: number|string = '';
    /** 是否付费 */
    strategyList: any[] = [
        {id: 0, description: '免费'},
        {id: 1, description: '付费'}
    ];
    list: any[] = [
        { id: 0, description: '否' },
        { id: 1, description: '是' }
    ];
    /** 默认显示所有付费和非付费 */
    searchStrategy: number|string = '';
    /** 内容模糊查询 */
    searchText: string = '';
    /** 话题内容回复或评论列表 */
    topicComments: any[] = [];
    /** 分页信息 */
    pageInfo: any = {};
    /** 分页查询参数 */
    pageQueryStr: string = '';
    /** 操作, 默认更新操作 */
    operate: string = 'update';
    /** 操作内容 */
    operateTitle: string = '';
    /** 某个话题内容回复或评论 */
    topicComment: any = {};
    /** 窗体 */
    @Ref('window')
    window!: any;
    /** 选中的行 */
    rows: any[] = [];
    /** 所属话题内容id */
    tcid: number = -1;
    constructor() {
        super();
    }

    async activated() {
        this.handler.load();
        this.tcid = parseInt((<any>(this.$route.query['id'])) ,10);
        if(isNaN(this.tcid)) {
            this.handler.unload();
            this.handler.alert({
                content: '未选择父话题内容',
                buttons:['确认']
            });
            return;
        };
        await this.selectTopicCommentList();
        this.handler.unload();
    }

    /**
     * 查询话题内容回复或评论列表
     */
    selectTopicCommentList() {
        const queryStr = 
        '?tcid='+this.tcid
        +'&searchText='+this.searchText
        +'&searchVisible='+this.searchVisible
        +'&searchStrategy='+this.searchStrategy
        +'&'+this.pageQueryStr;
        return this.httpRequest(this.http.get('/topicComment/select/list'+queryStr), {
            success: (data: any) => {
                const pageInfo = data.pageInfo;
                // 获取话题内容回复或评论列表
                this.topicComments = pageInfo.list;
                const o:any = {};
                o.pages = pageInfo.pages;
                o.total = pageInfo.total;
                o.pageNum = pageInfo.pageNum;
                o.pageSize = pageInfo.pageSize;
                o.navPages = 5;
                o.pageSizes = [10,20,30,40,50];
                o.jump = true;
                o.detail = true;
                this.pageInfo = o;
            }
        });
    }

    /**
     * 去那一页或改变每页大小
     * @param o 
     */
    toPage(o: any) {
        this.pageQueryStr = o.queryStr;
        this.selectTopicCommentList();  
    }

    /**
     * 点击添加按钮，添加话题内容回复或评论
     */
    insert$() {
        this.operate = 'insert';
        this.operateTitle = '添加回复或评论';
        this.topicComment = {tcid:this.tcid, text:''};
        this.window.open();
    }

    /**
     * 点击上方curd-bar操作条的编辑按钮
     */
    select$() {
        if(this.rows.length !== 1) return;
        this.selectOne({row: this.rows[0]});
        this.rows = [];
    }

    /**
     * 点击保存按钮
     * 批量更新选中行
     */
    update$() {
        if(!this.rows.length)return;
        this.operate = 'update';
        this.insertOrUpdate(this.rows);
    }

    /**
     * 点击上方curd-bar操作条的删除按钮
     */
    delete$() {
        const ids = this.rows.map((row: any) => {
            return row.id;
        });
        this.delete(ids);
    }

    /**
     * 点击搜索按钮，搜索话题内容回复或评论
     */
    async search$() {
        this.handler.load();
        await this.selectTopicCommentList();
        this.handler.unload();
    }
    
    /**
     * 
     * @param {{row}} 编辑的某行
     */
    selectOne({row}: any) {
        this.operate = 'select';
        this.operateTitle = '编辑话题内容的回复或评论';
        this.httpRequest(this.http.get('/topicComment/select/one?id='+row.id),{
            success: (data: any) => {
                this.topicComment = data.topicComment;
                this.fixEditorBug();
                this.window.open();
            }
        });
    }

    /**
     * 点击行删除按钮
     * @param {{row}} 删除某行
     */
    deleteOne({row}: any) {
        this.delete([row.id]);
    }

    /**
     * 添加或修改话题内容回复或评论
     * 单个插入，单个或批量更新
     */
    insertOrUpdate(topicComment: any|any[]) {
        const insert = this.operate === 'insert';
        topicComment = insert?topicComment:(topicComment.length ? topicComment : [topicComment]);
        this.httpRequest(this.http.post('/topicComment/' + (!insert? 'batch/update':'insert'), topicComment), {
            success: (data: any) => {
                this.window.close();
                this.handler.toast({text:data.tip});
                this.selectTopicCommentList();
                this.rows = [];
            }
        })
    }

    /**
     *根据id数组单个或批量删除
     */
    delete(ids: number[]) {
        this.httpRequest(this.http.post('/topicComment/batch/delete', ids), {
            success: (data: any) => {
                this.selectTopicCommentList();
                this.handler.toast({text: data.tip});
                this.rows = [];
            }
        });
    }

    fixEditorBug() {
        const o = this.topicComment;
        this.topicComment = {text:''};
        setTimeout(() => {this.topicComment = o});
    }

    /** 关闭弹窗 */
    close() {
        this.window.close();
    }

    /** 确认并关闭弹窗 */
    confirm() {
        this.window.close();
        this.insertOrUpdate(this.topicComment);
    }
}
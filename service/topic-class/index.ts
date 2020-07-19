import { http } from "~/core/context/app-context";
/**
 * 话题内容分类服务
 */
export default class TopicClassService {
    
    /**
     * 查询单个分类信息
     * @param params {id - 分类id}
     * @param channel 
     */
    static selectOne(params: {id: number}, channel: string = '') {
        return http.get<{}>('/topicClass'+channel+'/select/one', {params});
    }

    /**
     * 查询话题列表
     * @param params 
     * @param channel 
     */
    static selectList(params: {type: number}, channel: string = '') {
        return http.get<{}[]>('/topicClass'+channel+'/select/list', {params});
    }
}
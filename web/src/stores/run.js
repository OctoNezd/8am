import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRuntimeStore = defineStore('runstore', () => {
    const nbtitle = ref('не установлено')
    return {
        nbtitle
    }
})


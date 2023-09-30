<template>
    <span>
        <md-list-item :headline="props.itemTitle" @click="isActive = true"
            :supporting-text="!dataSourceInvertedDisplay ? dataItems[props.modelValue] : props.modelValue">
            <mdicon :name="icon" slot="start" v-if="props.icon" class="listIcon" />
        </md-list-item>
        <section class="dataPicker background" v-if="isActive">
            <Header :title="props.pageTitle" searchable :search-placeholder="props.searchPlaceholder"
                @search-query-changed="sfilter = $event" @search-closed="sfilter = ''" @close="isActive = false"
                :closable="true"></Header>
            <div class="gl">
                <md-list style="
                        display: flex;
                        justify-content: stretch;
                        flex-direction: column;
                        max-width: 100%;
                    ">
                    <div v-for="[itemId, itemTitle] in Object.entries(dataItemsFiltered)" :key="itemId" class="groupitem">
                        <a @click="onSelect(itemId)" style="text-decoration: none">
                            <md-list-item :headline="itemId" :supporting-text="itemTitle"
                                v-if="dataSourceInvertedDisplay" />
                            <md-list-item :headline="itemTitle" :supporting-text="itemId" v-else />
                        </a>
                    </div>
                </md-list>
            </div>
        </section>
    </span>
</template>
<script setup>
import Header from './header.vue'
import { ref, computed, defineProps, watch, inject } from 'vue'
import '@material/web/list/list.js'
import '@material/web/list/list-item.js'
import '@material/web/progress/circular-progress.js'
const props = defineProps({
    pageTitle: String,
    itemTitle: String,
    searchPlaceholder: {
        type: String,
        default: "Поиск"
    },
    dataSource: {
        type: String,
    },
    dataSourceInvertedDisplay: {
        type: Boolean,
        default: false
    },
    icon: {
        type: String,
        default: false
    },
    modelValue: String
})
const isActive = ref(false)
const sfilter = ref('')
const dataItems = inject(props.dataSource)
function createDataItems() {
    let items = {}
    if (sfilter === '') {
        return dataItems;
    }
    if (dataItems.value === undefined) {
        console.error("invalid dataitems")
        return items
    }
    for (const [dataId, dataDisplay] of Object.entries(dataItems.value)) {
        let filterable = dataDisplay
        if (props.dataSourceInvertedDisplay) {
            filterable = dataId
        }
        if (filterable.toLowerCase().includes(sfilter.value.toLowerCase())) {
            items[dataId] = dataDisplay
        }
    }
    return items
}
const emit = defineEmits(['update:modelValue', 'close'])
function onSelect(value) {
    isActive.value = false
    emit("update:modelValue", value)
}
// computed doesn't work well with props it seems
const dataItemsFiltered = computed(createDataItems)

</script>
<style>
.gl {
    overflow-y: scroll;
}

.dataPicker {
    display: block !important;
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    z-index: 2000;
}

.loadingIndicator {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: 90vh;
}

.listIcon {
    padding-left: 16px;
}
</style>

<style scoped>
div.root {
    display: flex;
    align-items: center;
    margin: 3px 0px;
}

div.root:hover {
    background-color: aliceblue;
}

div.title {
    width: 30%;
    font-size: small;
    cursor: pointer;
    color: #343a40;
}

div.slot {
    width: 70%;
}

div.row {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    gap: 3px;
}
</style>

<template>
    <div class="root" style="">
        <div class="title" style="width: 25%;">
            <span v-if="props.tip == ''">{{ props.title }}</span>
            <span v-else>
                <el-tooltip :content="props.tip" placement="top" :enterable="false">
                    {{ props.title }}
                </el-tooltip>
            </span>
        </div>
        <div :class="{ 'slot': true, 'row': props.row }">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ElTooltip } from "element-plus";
const props = defineProps({
    title: String,
    tip: {
        type: String,
        otpional: true,
        default: ""
    },
    row: {
        type: Boolean,
        optional: true,
        default: true,
    }
})
</script>

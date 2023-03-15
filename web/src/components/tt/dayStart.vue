<template>
    <div :class="{ today }" :id="id" class="day">
        <div class="dayHeader surface-variant">
            <p>{{ date }} - {{ weekday }}</p>
            <div>
                <div v-if="today">
                    <div class="circle"></div>
                </div>
            </div>
        </div>
        <slot />
    </div>
</template>
<script setup>
const props = defineProps(['date', 'weekday', 'today', 'id'])
</script>
<style scoped>
.circle {
    content: ' ';
    margin: 15px;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    margin: 0 auto;
    transition: all 0.3s;
    background-color: var(--md-sys-color-on-tertiary-container);
    animation: blink 4s infinite;
}

@keyframes blink {
    0%,
    50%,
    100% {
        opacity: 1;
    }
    25%,
    75% {
        opacity: 0;
    }
}

.dayHeader {
    display: flex;
    flex-direction: row;
    padding: 2px;
    font-weight: bold;
    padding-left: 14px;
    padding-right: 14px;
    border-radius: 14px;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0px;
    @supports (top: env(safe-area-inset-top)) {
        top: calc(env(safe-area-inset-top) + 10px);
    }
}
</style>


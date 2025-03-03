<script setup>
const sampleChampionshipName = '第102回 全高校サッカー選手権大会'
const sampleRound = '札幌地区予選会';
const sampleRoundName = 'Aブロック';
</script>

<template>
<div class="bg-white p-4">
    <div>
        <h1 class="text-xl">今週の試合</h1>
        <div class="bg-[#090A0A] text-[#FAFAFC] w-fit px-1">2025.2.22(Sat)</div>
        <div class="flex justify-between items-center border-t-1 border-gray-300 py-2">
            <img src="@/assets/top-sample/keithston.png" alt="発寒南FC" class="block w-1/7 h-full">
            <div class="text-center w-5/7 px-2">
                <div>
                    <p class="text-[#666C6C]">{{ sampleChampionshipName }}</p>
                    <p class="text-[#666C6C]">{{ sampleRound }}</p>
                    <p class="text-[#666C6C]">{{ sampleRoundName }}第一試合</p>
                </div>
                <div class="flex justify-between">
                    <div class="block w-2/5 text-[#666C6C]">発寒南FC</div>
                    <div class="block w-1/5 font-bold text-xl text-[#231815]">2 - 2</div>
                    <div class="block w-2/5 text-[#666C6C]">清田FC</div>
                </div>
                <div>
                    <span class="text-[#F24D11] font-bold">2 PK 3</span>
                </div>
            </div>
            <img src="@/assets/top-sample/salfordBlueYellow.png" alt="清田FC" class="block w-1/7 h-full">
        </div>

        <div class="flex justify-between items-center border-t-1 border-gray-300 py-2">
            <img src="@/assets/top-sample/salfordBlueRed.png" alt="苗穂FC" class="block w-1/7 h-full">
            <div class="text-center w-5/7 px-2">
                <div>
                    <p class="text-[#666C6C]">{{ sampleChampionshipName }}</p>
                    <p class="text-[#666C6C]">{{ sampleRound }}</p>
                    <p class="text-[#666C6C]">{{ sampleRoundName }}第二試合</p>
                </div>
                <div class="flex justify-between">
                    <div class="block w-2/5 text-[#666C6C]">発寒南FC</div>
                    <div class="block w-1/5 font-bold text-xl text-[#231815]">4 - 0</div>
                    <div class="block w-2/5 text-[#666C6C]">清田FC</div>
                </div>
                <div>
                </div>
            </div>
            <img src="@/assets/top-sample/borcelle.png" alt="厚別西FC" class="block w-1/7 h-full">
        </div>

        <div class="flex justify-between items-center border-t-1 border-gray-300 py-2">
            <img src="@/assets/top-sample/rimberio.png" alt="苗穂FC" class="block w-1/7 h-full">
            <div class="text-center w-5/7 px-2">
                <div>
                    <p class="text-[#666C6C]">{{ sampleChampionshipName }}</p>
                    <p class="text-[#666C6C]">{{ sampleRound }}</p>
                    <p class="text-[#666C6C]">{{ sampleRoundName }}第三試合</p>
                </div>
                <div class="flex justify-between">
                    <div class="block w-2/5 text-[#666C6C]">発寒南FC</div>
                    <div class="block w-1/5 font-bold text-xl text-[#231815]">1 - 2</div>
                    <div class="block w-2/5 text-[#666C6C]">清田FC</div>
                </div>
            </div>
            <img src="@/assets/top-sample/salfordGreenWhite.png" alt="厚別西FC" class="block w-1/7 h-full">
        </div>
    </div>

    <div class="mt-4">
        <div class="bg-[#090A0A] text-[#FAFAFC] w-fit px-1">2025.2.23(Sun)</div>
        <div class="flex justify-between items-center border-t-1 border-gray-300 py-2">
            <img src="@/assets/top-sample/salfordCrown.png" alt="新琴似FC" class="block w-1/7 h-full">
            <div class="text-center w-5/7 px-2">
                <div>
                    <p class="text-[#666C6C]">{{ sampleChampionshipName }}</p>
                    <p class="text-[#666C6C]">{{ sampleRound }}</p>
                    <p class="text-[#666C6C]">Bブロック第一試合</p>
                </div>
                <div class="flex justify-between">
                    <div class="block w-2/5 text-[#666C6C]">発寒南FC</div>
                    <div class="block w-1/5 font-bold text-xl text-[#231815]">2 - 11</div>
                    <div class="block w-2/5 text-[#666C6C]">清田FC</div>
                </div>
                <div>
                </div>
            </div>
            <img src="@/assets/top-sample/hanover.png" alt="白石FC" class="block w-1/7 h-full">
        </div>

        <div class="flex justify-between items-center border-t-1 border-gray-300 py-2">
            <img src="@/assets/top-sample/keithston.png" alt="発寒南FC" class="block w-1/7 h-full">
            <div class="text-center w-5/7 px-2">
                <div>
                    <p class="text-[#666C6C]">{{ sampleChampionshipName }}</p>
                    <p class="text-[#666C6C]">{{ sampleRound }}</p>
                    <p class="text-[#666C6C]">Bブロック第二試合</p>
                </div>
                <div class="flex justify-between">
                    <div class="block w-2/5 text-[#666C6C]">発寒南FC</div>
                    <div class="block w-1/5 font-bold text-xl text-[#231815]">0 - 0</div>
                    <div class="block w-2/5 text-[#666C6C]">清田FC</div>
                </div>
                <div>
                    <span class="text-[#F24D11] font-bold">2 PK 3</span>
                </div>
            </div>
            <img src="@/assets/top-sample/salfordBlueYellow.png" alt="清田FC" class="block w-1/7 h-full">
        </div>
    </div>
</div>
</template>

<style></style>
const enhancePercentage = `
0=100/0/1/1
1=90/0/1/1
2=80/0/1/1
3=70/0/1/1
4=50/0/1/1
5=45/0/2/2
6=40/35/2/2
7=35/35/2/2
8=35/35/2/2
9=35/35/2/2
10=30/0/3/5
11=30/35/3/5
12=30/35/3/5
13=30/35/3/5
14=30/35/3/5
15=20/0/4/8
16=20/35/4/8
17=20/35/4/8
18=20/35/4/8
19=20/35/4/8
20=10/0/5/10
21=10/35/5/10
22=10/35/5/10
23=10/35/5/10
24=10/35/5/10
25=5/35/6/12
26=5/35/6/12
27=5/35/6/12
28=5/35/6/12
29=5/35/6/12
30=2/35/8/14
`;

const enhancePercentageDict = enhancePercentage
    .split("\n")
    .filter(x => x !== "")
    .map(x => x.split("="))
    .map(x => ({from: x[0], chance: x[1].split("/")}))
    .map(x => ({
        from: x.from,
        successChance: parseInt(x.chance[0]),
        breakChance: parseInt(x.chance[1]),
        stoneUsage: parseInt(x.chance[2]),
        jellyUsage: parseInt(x.chance[3]),
    }))
    .reduce((acc, cur) => ({...acc, [cur.from]: cur}), {});

const simulateEnhance = (from, to, use_jelly = false, added_chance = 0, multiply_chance = 1) => {
    let iteration = 0;
    let stone_used = 0;
    let jelly_used = 0;
    let progression = [];

    let current = from;
    let min_level = current;
    while (current < to) {
        iteration += 1;
        const chance = enhancePercentageDict[current];
        stone_used += chance.stoneUsage;
        const r_success = Math.random() * 100;
        if (r_success <= (chance.successChance + added_chance) * multiply_chance) {
            current += 1;
            progression.push("+");
        } else {
            if (use_jelly) {
                jelly_used += chance.jellyUsage;
                progression.push("#")
            } else {
                const r_break = Math.random() * 100;
                if (r_break <= chance.breakChance) {
                    current -= 1;
                    progression.push("-")
                    if (current < min_level) min_level = current;
                } else {
                    progression.push("#")
                }
            }
        }
    }

    return {
        iteration,
        gold_usage: iteration * 10000,
        stone_used,
        jelly_used,
        min_level,
        progression,
    }
};

const averageSimulateEnhance = (from, to, use_jelly = false, added_chance = 0, multiply_chance = 1, iteration = 1000) => {
    let simulations = [];
    let sum_stone_used = 0;
    let max_stone_used = 0;
    let min_stone_used = 999999999;
    for (let i = 0; i < iteration; i++) {
        const sim = simulateEnhance(from, to, use_jelly, added_chance, multiply_chance);
        simulations.push(sim);
        sum_stone_used += sim.stone_used;
        if (sim.stone_used > max_stone_used) {
            max_stone_used = sim.stone_used;
        }
        if (sim.stone_used < min_stone_used) {
            min_stone_used = sim.stone_used;
        }
    }
    return {
        simulations,
        average_stone_used: sum_stone_used / iteration,
        max_stone_used,
        min_stone_used,
    }
};

onmessage = function (e) {
    console.log(e);
    if (e.data.type === "simulateEnhance") {
        const output = averageSimulateEnhance(...e.data.args);
        const truncated_output = {...output, simulations: []};
        console.log(truncated_output);
        postMessage({
            type: "simulateEnhance",
            data: truncated_output
        });
    }
};
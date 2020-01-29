const {useState, useCallback, useEffect} = React;

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

const enhancePercentageList = enhancePercentage
    .split("\n")
    .filter(x => x !== "")
    .map(x => x.split("="))
    .map(x => ({from: x[0], chance: x[1].split("/")}))
    .map(x => ({
        from: parseInt(x.from),
        successChance: parseInt(x.chance[0]),
        breakChance: parseInt(x.chance[1]),
        stoneUsage: parseInt(x.chance[2]),
        jellyUsage: parseInt(x.chance[3]),
    }));
const enhancePercentageDict = enhancePercentageList.reduce((acc, cur) => ({...acc, [cur.from]: cur}), {});

// console.log("No Jelly, No Event");
// console.log(averageSimulateEnhance(0, 10, false, 0, 1, 1000000));
// console.log("W/ Jelly, No Event");
// console.log(averageSimulateEnhance(0, 10, true, 0, 1, 1000000));
// console.log("No Jelly, W/ Event");
// console.log(averageSimulateEnhance(0, 10, false, 10, 1, 1000000));
// console.log("W/ Jelly, W/ Event");
// console.log(averageSimulateEnhance(0, 10, true, 10, 1, 1000000));
// console.log("No Jelly, W/ Event, Bad Luck");
// console.log(averageSimulateEnhance(0, 10, false, 10, 0.75, 1000000));
// console.log("W/ Jelly, W/ Event, Bad Luck");
// console.log(averageSimulateEnhance(0, 10, true, 10, 0.75, 1000000));

const worker = new Worker("worker.min.js");

const WorkingImage = ({status}) => {

    let [enhStatusAnimation, setEnhStatusAnimation] = useState(1);

    useEffect(() => {
        const i = setInterval(() => {
            setEnhStatusAnimation((s) => s + 1);
        }, 50);
        return () => {
            clearInterval(i);
        }
    });

    if (status === "idle") {
        return <img alt={"BS"} src={"images/bs_1.jpg"} width={200}/>;
    } else {
        if (enhStatusAnimation % 2 === 1) {
            return <img alt={"BS"} src={"images/bs_1.jpg"} width={200}/>;
        } else {
            return <img alt={"BS"} src={"images/bs_2.jpg"} width={200}/>
        }
    }

};

const App = () => {
    let [enhInputFrom, setEnhInputFrom] = useState("10");
    let [enhInputTo, setEnhInputTo] = useState("15");

    let [enhInputOptJelly, setEnhInputOptJelly] = useState(false);
    let [enhInputOptEvent, setEnhInputOptEvent] = useState(false);
    let [enhInputOptBadLuck, setEnhInputOptBadLuck] = useState(false);

    let [enhSimulationOutput, setEnhSimulationOutput] = useState({});
    let [enhStatus, setEnhStatus] = useState("idle");

    let [showEnhTable, setShowEnhTable] = useState(false);

    useEffect(() => {
        worker.onmessage = (e) => {
            if (e.data.type === "simulateEnhance") {
                const output = e.data.data;
                // const truncated_output = {...output, simulations: []};
                setEnhStatus("idle");
                setEnhSimulationOutput(output);
            }
        };
    });


    return (
        <div>
            <h1>LIONIELZ's WoDN Tools</h1>
            <hr />
            <h2>Enhance Simulation</h2>
            <form className="form-inline">
                <div className={"mr-2"}>
                    Enhance from
                </div>
                <input type={"number"} min={0} max={50} className={"form-control"} value={enhInputFrom} onChange={(e) => setEnhInputFrom(e.target.value)}/>
                <div className={"ml-2 mr-2"}>
                    to
                </div>
                <input type={"number"} min={0} max={50} className={"form-control"} value={enhInputTo} onChange={(e) => setEnhInputTo(e.target.value)}/>
                <input type={"button"} value={"Simulate"} className={"btn btn-primary ml-2"} onClick={() => {
                    const from_num = parseInt(enhInputFrom);
                    const to_num = parseInt(enhInputTo);
                    if (isNaN(from_num) || from_num < 0 || from_num > 50) return alert("Please input valid from");
                    if (isNaN(to_num) || to_num < 0 || to_num > 50 || to_num <= from_num) return alert("Please input valid to");
                    const use_jelly = enhInputOptJelly;
                    const added_chance = enhInputOptEvent ? 10 : 0;
                    const multiply_chance = enhInputOptBadLuck ? 0.75 : 1;
                    const iteration = 1000000;
                    // const output = averageSimulateEnhance(from_num, to_num, use_jelly, added_chance, multiply_chance, iteration);
                    // const truncated_output = {...output, simulations: []};
                    // console.log(truncated_output);
                    // setEnhSimulationOutput(truncated_output);
                    setEnhStatus("working");
                    worker.postMessage({
                        type: "simulateEnhance",
                        args: [
                            from_num, to_num, use_jelly, added_chance, multiply_chance, iteration
                        ]
                    })
                }}/>
            </form>
            <form className="form-inline">
                <div className="form-check mb-2 mr-sm-2">
                    <input className="form-check-input" type="checkbox" id="enh_option_jelly" checked={enhInputOptJelly} onChange={(e) => setEnhInputOptJelly(e.target.checked)}/>
                    <label className="form-check-label" htmlFor="enh_option_jelly">
                        Use Jelly
                    </label>
                </div>
                <div className="form-check mb-2 mr-sm-2">
                    <input className="form-check-input" type="checkbox" id="enh_option_event" checked={enhInputOptEvent} onChange={(e) => setEnhInputOptEvent(e.target.checked)}/>
                    <label className="form-check-label" htmlFor="enh_option_event">
                        Event +10%
                    </label>
                </div>
                <div className="form-check mb-2 mr-sm-2">
                    <input className="form-check-input" type="checkbox" id="enh_option_badluck" checked={enhInputOptBadLuck} onChange={(e) => setEnhInputOptBadLuck(e.target.checked)}/>
                    <label className="form-check-label" htmlFor="enh_option_badluck">
                        Bad Luck
                    </label>
                </div>
            </form>
            <div className={"mt-2"}>
                <WorkingImage status={enhStatus}/>
                <img alt={"BS"} src={"images/bs_1.jpg"} width={1}/>
                <img alt={"BS"} src={"images/bs_1.jpg"} width={2}/>
            </div>
            {enhSimulationOutput.min_stone_used > 0 ? (
                <div>
                    Average: {enhSimulationOutput.average_stone_used}<br/>
                    Minimum: {enhSimulationOutput.min_stone_used}<br/>
                    Maximum: {enhSimulationOutput.max_stone_used}<br/>
                </div>
            ) : null}
            <div className={"mt-2"}>
                <input type={"button"} value={"Show Enhance Percentage Table"} className={"btn btn-secondary"} onClick={() => setShowEnhTable(!showEnhTable)}/>
                {showEnhTable ?
                    <table className={"table table-condensed mt-2"}>
                        <thead>
                        <tr>
                            <th>Level</th>
                            <th>Success %</th>
                            <th>Break Down %</th>
                            <th>Stone Usage</th>
                            <th>Jelly Usage</th>
                        </tr>
                        </thead>
                        {enhancePercentageList.map(row => (
                            <tr>
                                <td>+{row.from} to +{row.from + 1}</td>
                                <td>{row.successChance}%</td>
                                <td>{row.breakChance}</td>
                                <td>{row.stoneUsage}</td>
                                <td>{row.jellyUsage}</td>
                            </tr>
                        ))}
                    </table>
                    : null}
            </div>
        </div>
    )
};

ReactDOM.render((<App/>), document.getElementById("root"));
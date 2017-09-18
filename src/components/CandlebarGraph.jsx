import React from 'react';
const fetchJson  = require('node-fetch-json');
import fetch from 'node-fetch';
import moment from 'moment';

export default class CandlebarGraph extends React.Component {

    constructor(props) {
        super(props);
        this.state = {loaded: false};
        this.mouseMoveDetect = this.mouseMoveDetect.bind(this);
        this._scaling = props.scale;

        this._font =  (8*this._scaling) + "px Arial"
        this._candlewidth = 8 * this._scaling

        this._canvas_width = this.props.width * this._scaling;
        this._canvas_height = this.props.height * this._scaling;

    }

    drawRounds(config,rounds) {

        if (rounds.length >0 ) {
            _.each(rounds,(item) => {
                var pricePublishDate = item.closeDate+config.betMinRevealLength.toNumber();
                this.drawTimeGrid( pricePublishDate, CandlebarGraph.TARGETCOLOR);
                _.each(item.bets,(bet) => {
                    this.drawBet(pricePublishDate, bet.target/1000)
                });
            });

        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.config !== this.props.config
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.config != false && this.state.loaded === false && nextProps.rounds.length > 0) {
            this.updateGraph(nextProps.config);
            this.drawRounds(nextProps.config,nextProps.rounds);
            this.state.loaded = true;
           // this.forceUpdate();
        }
    }

    componentDidMount() {
        this._ctx = this.refs.canvas.getContext('2d');

    }

    async updateGraph(config) {
        let step = config.betCycleLength.toNumber();
        if (step < 7200) step = 7200;
        const startTime = (+new Date() / 1000) - 40 * step;
        const endTime= (+new Date() / 1000) + 2 * step + config.betMaxRevealLength.toNumber();
        await this.invalidate(startTime,endTime,step);
    }



    get FONT() { return this._font; }
    get CANDLEWIDTH() { return this._candlewidth; }
    static get REDCOLOR() { return "#FE2E2E"; }
    static get GREENCOLOR() { return "#2EFE2E"; }
    static get GRIDCOLOR() { return '#dddddd'; }
    static get TARGETCOLOR() { return '#0000FF'; }



    async invalidate ( startTime, endTime, step ) {

        this._startTime = startTime
        this._endTime = endTime

        const url = 'https://poloniex.com/public?command=returnChartData&currencyPair=USDT_ETH&start='+this._startTime+'&end='+this._endTime+'&period='+step
        const data = await fetch(url).then((data) => {
                return data.json();
        }).then(json => json).catch((e) => {
            console.log(e);
            return false;
        });
        await this.paint(data)

    }

    async paint( data ) {

        

        this._hiValue = data[0].high
        this._loValue = data[0].low

        for (let c=1;c<data.length;c++) {
            if (data[c].high > this._hiValue) this._hiValue=data[c].high;
            if (data[c].low < this._loValue) this._loValue=data[c].low;
        }

        let m_margin = 50
        this._hiValue = this._hiValue + m_margin;
        this._loValue = this._loValue - m_margin;

        this._scaleTime  =
            ( this._endTime- this._startTime ) /  this._canvas_width;

        this._scaleValue =
            ( this._hiValue - this._loValue) /  this._canvas_height;

        this._ctx.font = this.FONT;

        for (let c=0;c<data.length;c++) {

            if ( c > 0 && c % 4 == 0 ) {
                this.drawTimeGrid(data[c].date,CandlebarGraph.GRIDCOLOR)
            }

            const x = (data[c].date - this._startTime) / this._scaleTime

            const y_high = this._canvas_height - (data[c].high - this._loValue) / this._scaleValue
            const y_low = this._canvas_height - (data[c].low - this._loValue) / this._scaleValue
            const y_open = this._canvas_height - (data[c].open - this._loValue) / this._scaleValue
            const y_close = this._canvas_height - (data[c].close - this._loValue) / this._scaleValue

            this._ctx.beginPath();
            this._ctx.setLineDash([5, 0]);
            this._ctx.strokeStyle = '#222222';
            this._ctx.moveTo(x,y_high);
            this._ctx.lineTo(x,y_low);
            this._ctx.stroke();
            this._ctx.moveTo(x-this.CANDLEWIDTH/2,y_high);
            this._ctx.lineTo(x+this.CANDLEWIDTH/2,y_high);
            this._ctx.stroke();
            this._ctx.moveTo(x-this.CANDLEWIDTH/2,y_low);
            this._ctx.lineTo(x+this.CANDLEWIDTH/2,y_low);
            this._ctx.stroke();

            if (data[c].open >= data[c].close) {
                this._ctx.fillStyle = CandlebarGraph.GREENCOLOR;
                this._ctx.fillRect(
                    x-this.CANDLEWIDTH/2,y_close,
                    this.CANDLEWIDTH,y_open-y_close+1
                );
            } else {
                this._ctx.fillStyle = CandlebarGraph.REDCOLOR;
                this._ctx.fillRect(
                    x-this.CANDLEWIDTH/2,y_open,
                    this.CANDLEWIDTH,y_close-y_open+1
                );
            }
        }



    }

    mouseMoveDetect(e) {
        console.log(e);
        /*
            let y = this._canvas_height - (e.pageY - this._canvas.offsetTop)*this._scaling;
            let v = y*this._scaleValue + this._loValue
            v = Math.round(v * 100) / 100

            this._ctx.fillStyle = '#fff';
            this._ctx.fillRect(0,0, 100, 25);
            this._ctx.fillStyle = '#000';
            this._ctx.font = 'bold 20px arial';
            this._ctx.fillText(v, 0, 20, 100);
*/
    }


    drawTimeGrid(t, color) {

        const x = (t - this._startTime) / this._scaleTime

        this._ctx.beginPath();
        this._ctx.setLineDash([5, 3]);
        this._ctx.strokeStyle = color;
        this._ctx.moveTo(x,0);
        this._ctx.lineTo(x,this._canvas_height);
        this._ctx.stroke();

        this._ctx.fillStyle = "#000000";
        var date = new Date(t*1000);
        this._ctx.fillText(date.getDate()+" "+date.getHours()+"h",x,this._canvas_height-10);

    }

    drawBet(t, v) {
        console.log(t,v);
        const x = (t - this._startTime) / this._scaleTime
        const y = this._canvas_height - (v - this._loValue) / this._scaleValue

        this._ctx.beginPath();
        this._ctx.arc(x, y, 3, 0, 2 * Math.PI, false);
        this._ctx.fillStyle = '#000';
        this._ctx.fill();

    }

    render() {
        return(
            <canvas ref="canvas" width={this.props.width} height={this.props.height} style={{width:this._canvas_width,height:this._canvas_height}} />
        )
    }

}
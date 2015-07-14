function topPosition(domElt) {
  if (!domElt) {
    return 0;
  }
  return domElt.offsetTop + topPosition(domElt.offsetParent);
}

module.exports = function (React) {
  if (React.addons && React.addons.InfiniteScroll) {
    return React.addons.InfiniteScroll;
  }
  React.addons = React.addons || {};
  var InfiniteScroll = React.addons.InfiniteScroll = React.createClass({
    getDefaultProps: function () {
      return {
        pageStart: 0,
        hasMore: false,
        loadMore: function () {},
        threshold: 250,
        async: false
      };
    },
    componentDidMount: function () {
      this.pageLoaded = this.props.pageStart;
      this.attachScrollListener();
    },
    componentDidUpdate: function () {
      this.attachScrollListener();
    },
    render: function () {
      var props = this.props;
      return React.DOM.div(null, props.children, props.hasMore && (props.loader || InfiniteScroll._defaultLoader));
    },
    scrollListener: function () {
      var el = this.getDOMNode();
      var self = this;
      var listHeight = $(el).parent().parent().height();
      var scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
      var offsetBottom = Math.abs(el.parentNode.clientHeight + (topPosition(el) + el.offsetHeight - scrollTop - window.innerHeight))

      if ( listHeight - scrollTop < Number(this.props.threshold)) {
        this.detachScrollListener();
        console.log(el.parentNode.clientHeight + (topPosition(el) + el.offsetHeight - scrollTop - window.innerHeight))
        // call loadMore after detachScrollListener to allow
        // for non-async loadMore functions
        var resulst = this.props.loadMore(this.pageLoaded += 1);
        if(resulst != undefined){
          if(resulst.then != undefined){
            this.props.async = true;
            resulst.then(function(){
              self.props.async= false;
              self.attachScrollListener();

            })
          }
        }
      }
    },
    attachScrollListener: function () {
      if (!this.props.hasMore ||  this.props.async) {
        return;
      }
      window.addEventListener('scroll', this.scrollListener);
      window.addEventListener('resize', this.scrollListener);
      this.scrollListener();
    },
    detachScrollListener: function () {
      window.removeEventListener('scroll', this.scrollListener);
      window.removeEventListener('resize', this.scrollListener);
    },
    componentWillUnmount: function () {
      this.detachScrollListener();
    }
  });
  InfiniteScroll.setDefaultLoader = function (loader) {
    InfiniteScroll._defaultLoader = loader;
  };
  return InfiniteScroll;
};

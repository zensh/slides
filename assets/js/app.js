(function () {
	/* global Reveal, hljs */

	// Printing and PDF exports
	var link = document.createElement( 'link' )
	link.rel = 'stylesheet'
	link.type = 'text/css'
	link.href = window.location.search.match( /print-pdf/gi ) ? '../assets/reveal.js/css/print/pdf.css' : '../assets/reveal.js/css/print/paper.css'
	document.getElementsByTagName('head')[0].appendChild(link)

  // Full list of configuration options available at:
  // https://github.com/hakimel/reveal.js#configuration
  Reveal.initialize({
    controls: true,
    progress: true,
    history: true,
    center: true,
    width: 800,
    height: 600,

    transition: 'slide', // none/fade/slide/convex/concave/zoom
    backgroundTransition: 'convex', // none/fade/slide/convex/concave/zoom
    // Parallax background image
    // parallaxBackgroundImage: '', // e.g. "'https://s3.amazonaws.com/hakim-static/reveal-js/reveal-parallax-1.jpg'"

    // Parallax background size
    // parallaxBackgroundSize: '', // CSS syntax, e.g. "2100px 900px"

    // Optional reveal.js plugins
    dependencies: [{
      src: '../assets/reveal.js/lib/js/classList.js',
      condition: function () {
        return !document.body.classList
      }
    }, {
      src: '../assets/reveal.js/plugin/markdown/marked.js',
      condition: function () {
        return !!document.querySelector('[data-markdown]')
      }
    }, {
      src: '../assets/reveal.js/plugin/markdown/markdown.js',
      condition: function () {
        return !!document.querySelector('[data-markdown]')
      }
    }, {
      src: '../assets/reveal.js/plugin/highlight/highlight.js',
      async: true,
      condition: function () {
        return !!document.querySelector('pre code')
      },
      callback: function () {
        hljs.initHighlightingOnLoad()
      }
    }, {
      src: '../assets/reveal.js/plugin/zoom-js/zoom.js',
      async: true
    }, {
      src: '../assets/reveal.js/plugin/notes/notes.js',
      async: true
    }]
  })

  // Reveal.addEventListener('slidechanged', function(event) {
  // console.log(event.previousSlide, event.currentSlide, event.indexh, event.indexv)
  // })

  var _gaq = window._gaq = window._gaq || []
  _gaq.push(['_setAccount', 'UA-63568675-1'])
  _gaq.push(['_trackPageview'])
  _gaq.push(['send', 'pageview'])
}())

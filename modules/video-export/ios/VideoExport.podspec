Pod::Spec.new do |s|
  s.name           = 'VideoExport'
  s.version        = '1.0.0'
  s.summary        = 'Video export module with overlay support'
  s.description    = 'Custom native module for exporting videos with timestamp overlays'
  s.author         = ''
  s.homepage       = 'https://github.com/yourrepo/timestamps'
  s.platform       = :ios, '15.1'
  s.source         = { :git => '' }
  s.static_framework = true

  s.dependency 'React-Core'

  s.source_files = "**/*.{h,m,swift}"
end
